import type { TermEntry } from '#shared/types/api'
import { getData } from './data'

/**
 * Full-text search over all known terms, scoped to a single vocabulary for
 * queries looking like `skos:` or `skos:foo`.
 */
export async function searchTerms (rawQuery: string | undefined): Promise<TermEntry[]> {
  const query = String(rawQuery || '').replace(/---hash---/g, '#').trim()
  if (!query) {
    return []
  }

  const { fuse, fuseByPrefix } = await getData()

  // detect queries like this: `skos:`, `skos:foo`
  // do not detect queries containing a URL or spaces
  if (query.split(' ').length <= 1 && query.split('.').length <= 3 && !query.includes('://')) {
    const prefix = query.split(':')[0]
    // scope the search to only this prefix
    const scoped = prefix !== undefined && Object.hasOwn(fuseByPrefix, prefix) ? fuseByPrefix[prefix] : undefined
    if (scoped) {
      return scoped.search(query).slice(0, 10).map(({ item }) => item)
    }
  }

  return fuse.search(query).slice(0, 10).map(({ item }) => item)
}
