import { getData } from '../../utils/data.js'

export default defineEventHandler(async () => {
  const { prefixMetadata } = await getData()
  return Object.fromEntries(Object.entries(prefixMetadata).map(([prefix, value]) => [prefix, value.namespace]))
})
