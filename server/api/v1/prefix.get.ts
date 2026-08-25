import type { PrefixResponse } from '#shared/types/api'
import { getData } from '../../utils/data'
import { getQueryParam } from '../../utils/query'

export default defineEventHandler(async (event): Promise<PrefixResponse | []> => {
  const query = (getQueryParam(event, 'q') || '').trim()
  const prefix = query.split(':')[0] || ''
  const { prefixEndpointData, prefixMetadata } = await getData()

  const data = prefix && Object.hasOwn(prefixEndpointData, prefix) ? prefixEndpointData[prefix] : undefined
  const metadata = prefixMetadata[prefix]
  if (!data || !metadata) {
    setResponseStatus(event, 404)
    return []
  }
  return { data, metadata }
})
