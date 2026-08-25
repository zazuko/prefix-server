import { expand } from '@zazuko/vocabularies/expand'
import { shrink } from '@zazuko/vocabularies/shrink'
import type { IFuseOptions } from 'fuse.js'
import type { TermEntry } from '#shared/types/api'

// keep the caches bounded: they are fed with arbitrary user input
const CACHE_LIMIT = 50000
const shrunkCache = new Map<string, string>()
const expandedCache = new Map<string, string>()

function remember (cache: Map<string, string>, key: string, value: string): string {
  if (cache.size >= CACHE_LIMIT) {
    cache.clear()
  }
  cache.set(key, value)
  return value
}

// note: `threshold` is intentionally left at Fuse's default (a `treshold` typo in the
// original options meant that it never applied, and the search results depend on it)
export const fuseOptions: IFuseOptions<TermEntry> = {
  shouldSort: true,
  distance: 40,
  minMatchCharLength: 2,
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

export function cachedShrink (iri: string): string {
  const cached = shrunkCache.get(iri)
  if (cached !== undefined) {
    return cached
  }
  return remember(shrunkCache, iri, shrink(iri) || iri)
}

export function cachedExpand (prefixed: string): string {
  const cached = expandedCache.get(prefixed)
  if (cached !== undefined) {
    return cached
  }
  try {
    return remember(expandedCache, prefixed, expand(prefixed) || prefixed)
  }
  catch {
    // not expandable
    return prefixed
  }
}
