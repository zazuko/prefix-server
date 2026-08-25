import { expand } from '@zazuko/vocabularies/expand'
import { shrink } from '@zazuko/vocabularies/shrink'

// keep the caches bounded: they are fed with arbitrary user input
const CACHE_LIMIT = 50000
const shrunkCache = new Map()
const expandedCache = new Map()

function remember (cache, key, value) {
  if (cache.size >= CACHE_LIMIT) {
    cache.clear()
  }
  cache.set(key, value)
  return value
}

export const fuseOptions = {
  caseSensitive: true,
  shouldSort: true,
  treshold: 0.2,
  distance: 40,
  minMatchCharLength: 2,
  maxPatternLength: 40,
  keys: [{
    name: 'prefixed',
    weight: 6 / 15
  }, {
    name: 'label',
    weight: 4 / 15
  }, {
    name: 'parts.object.value',
    weight: 2 / 15
  }, {
    name: 'iri.value',
    weight: 3 / 15
  }]
}

export function cachedShrink (iri) {
  if (shrunkCache.has(iri)) {
    return shrunkCache.get(iri)
  }
  return remember(shrunkCache, iri, shrink(iri) || iri)
}

export function cachedExpand (prefixed) {
  if (expandedCache.has(prefixed)) {
    return expandedCache.get(prefixed)
  }
  try {
    return remember(expandedCache, prefixed, expand(prefixed) || prefixed)
  }
  catch {
    // not expandable
    return prefixed
  }
}
