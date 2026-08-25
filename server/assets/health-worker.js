/*
 * Health endpoint served from a dedicated worker thread.
 *
 * This file is a server asset: `server/plugins/health.js` reads its source and
 * evaluates it in a worker thread, so it must stay self-contained (no imports).
 *
 * The worker has its own event loop, so it keeps answering instantly even while
 * the main thread is busy (SSR rendering, fuzzy searches, GC pauses, …).
 *
 * The main thread posts a heartbeat regularly. If it stops doing so for longer
 * than `maxStallMs`, the endpoint reports the process as unhealthy (HTTP 503)
 * so that a hung process still gets restarted by its orchestrator.
 */
const http = process.getBuiltinModule('node:http')
const { parentPort, workerData } = process.getBuiltinModule('node:worker_threads')

const { host, port, maxStallMs } = workerData

const OK_BODY = JSON.stringify('ok')

let lastHeartbeat = Date.now()

parentPort.on('message', (message) => {
  if (message === 'heartbeat') {
    lastHeartbeat = Date.now()
  }
})

function respond (res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  })
  res.end(body)
}

const server = http.createServer((req, res) => {
  const stalledFor = Date.now() - lastHeartbeat

  if (maxStallMs > 0 && stalledFor > maxStallMs) {
    respond(res, 503, JSON.stringify({
      status: 'unhealthy',
      reason: `main thread unresponsive for ${stalledFor}ms`
    }))
    return
  }

  respond(res, 200, OK_BODY)
})

server.on('error', (error) => {
  parentPort.postMessage({ type: 'error', code: error.code, message: error.message })
  // only stops this worker thread, not the whole process
  process.exit(1)
})

server.listen({ host, port }, () => {
  parentPort.postMessage({ type: 'listening', address: server.address() })
})
