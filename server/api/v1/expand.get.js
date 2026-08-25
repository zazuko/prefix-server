import { getQueryParam } from '../../utils/query.js'
import { cachedExpand } from '../../utils/vocabularies.js'

export default defineEventHandler((event) => {
  const prefixed = getQueryParam(event, 'q')

  if (!prefixed) {
    setResponseStatus(event, 400)
    return { help: '/api/v1/expand?q=…' }
  }

  const attempt = cachedExpand(prefixed)
  if (attempt !== prefixed) {
    return { success: true, value: attempt }
  }
  setResponseStatus(event, 404)
  return { success: false }
})
