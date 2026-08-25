import { getQueryParam } from '../../utils/query'
import { searchTerms } from '../../utils/search'

export default defineEventHandler(async (event): Promise<string[]> => {
  const results = await searchTerms(getQueryParam(event, 'q'))
  return results.map(item => item.prefixed)
})
