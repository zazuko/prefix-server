/*
 * Health endpoint on the main server port. It shares the main event loop, so it
 * can only answer once the main thread is free: probes should rather target the
 * same endpoint on the dedicated port served by `server/plugins/health.ts`.
 */
const OK_BODY = JSON.stringify('ok')

export default defineEventHandler((event): string => {
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store')
  return OK_BODY
})
