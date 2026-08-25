/*
 * Nuxt module exposing the health endpoint `/api/v1/health` twice:
 *
 * 1. On the main server port, registered *before* every other server
 *    middleware: no ETag hashing, no preconditions, no express routing.
 *    It still shares the main event loop, so it can only answer once the
 *    main thread is free.
 *
 * 2. On a dedicated port (`HEALTH_PORT`, default 3001), served by a worker
 *    thread with its own event loop. This one answers immediately no matter
 *    how busy the main thread is, which makes it the right target for
 *    liveness/readiness probes and the Docker HEALTHCHECK.
 *
 * Environment variables:
 *   HEALTH_PORT          port of the dedicated health server (default: 3001)
 *   HEALTH_HOST          host to bind it to (default: same as the main server)
 *   HEALTH_MAX_STALL_MS  report 503 when the main thread has not shown signs
 *                        of life for that long (default: 30000, 0 disables)
 */
const path = require('path')
const { Worker } = require('worker_threads')
const consola = require('consola')

const HEALTH_PATH = '/api/v1/health'
const HEARTBEAT_INTERVAL_MS = 1000
const OK_BODY = JSON.stringify('ok')

const logger = consola.withTag('health')

function healthHandler (req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(OK_BODY),
    'Cache-Control': 'no-store'
  })
  res.end(OK_BODY)
}

function envInteger (name, fallback) {
  const value = Number.parseInt(process.env[name], 10)
  return Number.isNaN(value) ? fallback : value
}

function displayHost (host) {
  if (['0.0.0.0', '::'].includes(host)) {
    return 'localhost'
  }
  return host.includes(':') ? `[${host}]` : host
}

module.exports = function healthModule () {
  const { nuxt, options } = this

  // 1. main port: first in the middleware chain
  options.serverMiddleware.unshift({ path: HEALTH_PATH, handler: healthHandler })

  // 2. dedicated port: worker thread
  let worker = null
  let heartbeat = null

  const stop = async () => {
    if (heartbeat) {
      clearInterval(heartbeat)
      heartbeat = null
    }
    if (worker) {
      const running = worker
      worker = null
      await running.terminate()
    }
  }

  nuxt.hook('listen', async (server) => {
    await stop()

    // bind to the same interface as the main server (`server.address()` is the
    // address actually bound, unlike `listener.host` which is rewritten for display)
    const address = server.address()
    const host = process.env.HEALTH_HOST || (address && typeof address === 'object' && address.address) || '0.0.0.0'
    const port = envInteger('HEALTH_PORT', 3001)
    const maxStallMs = envInteger('HEALTH_MAX_STALL_MS', 30000)

    const current = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: { host, port, maxStallMs }
    })
    // the health worker must never keep the process alive on its own
    current.unref()
    worker = current

    current.on('message', (message) => {
      if (message.type === 'listening') {
        logger.ready(`Health endpoint listening on http://${displayHost(host)}:${message.address.port}${HEALTH_PATH}`)
      }
      else if (message.type === 'error') {
        logger.error(`Health endpoint cannot listen on ${host}:${port}: ${message.message}`)
      }
    })
    current.on('error', (error) => {
      logger.error('Health worker crashed:', error)
    })
    current.on('exit', (code) => {
      if (worker === current) {
        // unexpected exit (not triggered by `stop`)
        worker = null
        logger.error(`Health worker exited with code ${code}; ${HEALTH_PATH} is no longer served on port ${port}`)
      }
    })

    heartbeat = setInterval(() => {
      if (worker === current) {
        current.postMessage('heartbeat')
      }
    }, HEARTBEAT_INTERVAL_MS)
    heartbeat.unref()
  })

  nuxt.hook('close', stop)
}
