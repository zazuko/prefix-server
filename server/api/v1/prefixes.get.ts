import { getData } from '../../utils/data'

export default defineEventHandler(async (): Promise<Record<string, string>> => {
  const { prefixMetadata } = await getData()
  return Object.fromEntries(Object.entries(prefixMetadata).map(([prefix, value]) => [prefix, value.namespace]))
})
