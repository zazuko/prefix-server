import { getQueryParam } from '../../utils/query.js'
import { searchTerms } from '../../utils/search.js'

export default defineEventHandler(async (event) => {
  const results = await searchTerms(getQueryParam(event, 'q'))
  return results.map(item => item.prefixed)
})
