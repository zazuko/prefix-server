/*
 * Serves `/api/v1/health` on a dedicated port (`HEALTH_PORT`, default 3001)
 * from a worker thread with its own event loop, so that it answers immediately
 * no matter how busy the main thread is. This is the endpoint liveness and
 * readiness probes (and the Docker HEALTHCHECK) should target.
 *
 * Environment variables:
 *   HEALTH_PORT          port of the dedicated health server (default: 3001)
 *   HEALTH_HOST          host to bind it to (default: same as the main server)
 *   HEALTH_MAX_STALL_MS  report 503 when the main thread has not shown signs
 *                        of life for that long (default: 30000, 0 disables)
 */
import type { AddressInfo } from 'node:net'
import { Worker } from 'node:worker_threads'
import consola from 'consola'

const HEALTH_PATH = '/api/v1/health'
const HEARTBEAT_INTERVAL_MS = 1000

const logger = consola.withTag('health')

interface ListeningMessage {
  type: 'listening'
  address: AddressInfo | string | null
}

interface ErrorMessage {
  type: 'error'
  code?: string
  message: string
}

type WorkerMessage = ListeningMessage | ErrorMessage

function envInteger (name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? '', 10)
  return Number.isNaN(value) ? fallback : value
}

function displayHost (host: string | undefined): string {
  if (!host || ['0.0.0.0', '::'].includes(host)) {
    return 'localhost'
  }
  return host.includes(':') ? `[${host}]` : host
}

function listeningPort (address: ListeningMessage): number | string {
  return typeof address.address === 'object' && address.address !== null ? address.address.port : String(address.address)
}

async function loadWorkerSource (): Promise<string> {
  // the worker script is a server asset, available in dev and in the bundled output alike.
  // It stays plain JavaScript on purpose: it is evaluated as source in the worker.
  const source = await useStorage('assets:server').getItemRaw<Buffer | string>('health-worker.js')
  if (!source) {
    throw new Error('server/assets/health-worker.js is missing')
  }
  return Buffer.isBuffer(source) ? source.toString('utf8') : String(source)
}

export default defineNitroPlugin((nitroApp) => {
  // same interface as the main server (nitro's node server reads NITRO_HOST/HOST)
  const host = process.env.HEALTH_HOST || process.env.NITRO_HOST || process.env.HOST || undefined
  const port = envInteger('HEALTH_PORT', 3001)
  const maxStallMs = envInteger('HEALTH_MAX_STALL_MS', 30000)

  let worker: Worker | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let stopping = false

  nitroApp.hooks.hook('close', async () => {
    stopping = true
    if (heartbeat) {
      clearInterval(heartbeat)
    }
    if (worker) {
      await worker.terminate()
    }
  })

  loadWorkerSource().then((source) => {
    if (stopping) {
      return
    }
    const current = new Worker(source, { eval: true, workerData: { host, port, maxStallMs } })
    // the health worker must never keep the process alive on its own
    current.unref()
    worker = current

    current.on('message', (message: WorkerMessage) => {
      if (message.type === 'listening') {
        logger.ready(`Health endpoint listening on http://${displayHost(host)}:${listeningPort(message)}${HEALTH_PATH}`)
      }
      else if (message.type === 'error') {
        logger.error(`Health endpoint cannot listen on ${displayHost(host)}:${port}: ${message.message}`)
      }
    })
    current.on('error', (error) => {
      logger.error('Health worker crashed:', error)
    })
    current.on('exit', (code) => {
      if (worker === current) {
        worker = null
        if (!stopping) {
          logger.error(`Health worker exited with code ${code}; ${HEALTH_PATH} is no longer served on port ${port}`)
        }
      }
    })

    heartbeat = setInterval(() => {
      if (worker === current) {
        current.postMessage('heartbeat')
      }
    }, HEARTBEAT_INTERVAL_MS)
    heartbeat.unref()
  }).catch((error) => {
    logger.error('Health endpoint could not be started:', error)
  })
})
