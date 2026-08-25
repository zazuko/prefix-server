import { getQueryParam } from '../../utils/query'
import { searchTerms } from '../../utils/search'

export default defineEventHandler(event => searchTerms(getQueryParam(event, 'q')))
