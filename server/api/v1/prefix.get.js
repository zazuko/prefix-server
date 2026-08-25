import { getData } from '../../utils/data.js'
import { getQueryParam } from '../../utils/query.js'

export default defineEventHandler(async (event) => {
  const query = String(getQueryParam(event, 'q') || '').trim()
  const prefix = query.split(':')[0]
  const { prefixEndpointData, prefixMetadata } = await getData()

  if (!prefix || !Object.hasOwn(prefixEndpointData, prefix)) {
    setResponseStatus(event, 404)
    return []
  }
  return {
    data: prefixEndpointData[prefix],
    metadata: prefixMetadata[prefix]
  }
})
