import type { ConversionResponse, HelpResponse } from '#shared/types/api'
import { getQueryParam } from '../../utils/query'
import { cachedExpand } from '../../utils/vocabularies'

export default defineEventHandler((event): ConversionResponse | HelpResponse => {
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
