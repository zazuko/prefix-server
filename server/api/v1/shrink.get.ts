import type { ConversionResponse, HelpResponse } from '#shared/types/api'
import { getQueryParam } from '../../utils/query'
import { cachedShrink } from '../../utils/vocabularies'

export default defineEventHandler((event): ConversionResponse | HelpResponse => {
  let iri = getQueryParam(event, 'q')

  if (!iri) {
    setResponseStatus(event, 400)
    return { help: '/api/v1/shrink?q=…' }
  }

  // detect URI encoded `://`
  if (iri.includes('%3A%2F%2F')) {
    iri = decodeURIComponent(iri)
  }
  const attempt = cachedShrink(iri)
  if (attempt !== iri) {
    return { success: true, value: attempt }
  }
  setResponseStatus(event, 404)
  return { success: false }
})
