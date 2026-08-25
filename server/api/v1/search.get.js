import { getQueryParam } from '../../utils/query.js'
import { searchTerms } from '../../utils/search.js'

export default defineEventHandler(event => searchTerms(getQueryParam(event, 'q')))
