import prefixes from '@zazuko/vocabularies/prefixes'
import { getData } from '../../utils/data.js'
import { getQueryParam } from '../../utils/query.js'
import { cachedExpand } from '../../utils/vocabularies.js'

export default defineEventHandler(async (event) => {
  if (!('q' in getQuery(event))) {
    setResponseStatus(event, 400)
    return { help: '/api/v1/autocomplete?q=…[&type=…][&case=true][&expand]' }
  }

  const query = String(getQueryParam(event, 'q') ?? '')
  const matchCase = getQueryParam(event, 'case') === 'true'
  const expand = getQueryParam(event, 'expand') === 'true'
  const type = getQueryParam(event, 'type')
  const { prefixComplete } = await getData()

  if (!query.includes(':')) {
    const potentialPrefixes = Object.keys(prefixComplete).filter(prefix => prefix.startsWith(query))
    if (expand) {
      return potentialPrefixes.map(prefix => prefixes[prefix])
    }
    return potentialPrefixes.map(prefix => `${prefix}:`)
  }

  const [searchPrefix, searchTerm] = query.split(':')
  const vocabKey = matchCase ? searchPrefix : searchPrefix.toLowerCase()
  const vocab = Object.hasOwn(prefixComplete, vocabKey) ? prefixComplete[vocabKey] : null
  if (!vocab) {
    setResponseStatus(event, 404)
    return { success: false }
  }

  if (type && !type.includes(':')) {
    return []
  }

  const matchesTerm = term => matchCase
    ? term.startsWith(searchTerm)
    : term.toLowerCase().startsWith(searchTerm.toLowerCase())
  const matchesType = types => !type || types.some(t => matchCase ? t === type : t.toLowerCase() === type.toLowerCase())

  const results = Object.entries(vocab)
    .filter(([term, types]) => matchesTerm(term) && matchesType(types))
    .map(([term]) => `${searchPrefix}:${term}`)

  if (expand) {
    return results.map(cachedExpand)
  }
  return results
})
