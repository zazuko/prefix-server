import hash from 'string-hash'

/*
 * The content only changes with a new build, so the ETag of a URL is derived
 * from the application version. Conditional requests get a `304 Not Modified`
 * without rendering anything.
 */
export default defineEventHandler((event) => {
  if (event.path.startsWith('/api/v1/health')) {
    return
  }

  const { version } = useRuntimeConfig(event).public
  const etag = `"${hash(`${version ? version.name : ''}:${event.path}`).toString(16)}"`
  setHeader(event, 'ETag', etag)

  const ifNoneMatch = getRequestHeader(event, 'if-none-match')
  if (ifNoneMatch && ifNoneMatch.split(',').map(value => value.trim()).includes(etag)) {
    return sendNoContent(event, 304)
  }
})
