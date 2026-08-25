/*
 * Builds the data used by the API from `@zazuko/vocabularies`.
 * Run through `npm run build-data`: node executes this TypeScript file directly
 * (type stripping), hence the explicit `.ts` extensions and `import type`s.
 */
import rdf from '@rdfjs/data-model'
import type { DatasetCore, Quad } from '@rdfjs/types'
import { prefixes, vocabularies } from '@zazuko/vocabularies'
import meta from '@zazuko/vocabularies/meta'
import createDebug from 'debug'
import { sortBy } from 'lodash-es'
import type {
  DataFiles,
  PrefixComplete,
  PrefixEndpointData,
  PrefixMetadata,
  PrefixTermSummary,
  SummaryEntry,
  TermEntry,
  TermPart
} from '#shared/types/api'
import { cachedShrink } from '../server/utils/vocabularies.ts'

const debug = createDebug('prefix-server')

const labelPredicates = [
  'http://www.w3.org/2000/01/rdf-schema#label',
  'http://www.w3.org/2004/02/skos/core#prefLabel'
]

/**
 * `@zazuko/vocabularies` returns rdf-ext datasets: `filter()` keeps their index
 * order, which the search results (and the historical data files) depend on.
 */
type FilterableDataset = DatasetCore & {
  filter (predicate: (quad: Quad) => boolean): Iterable<Quad>
}

type Datasets = Record<string, FilterableDataset>

interface SearchArrays {
  summary: SummaryEntry[]
  searchArray: TermEntry[]
  searchArrayByPrefix: Record<string, TermEntry[]>
  prefixEndpointData: Record<string, PrefixEndpointData>
  stats: {
    loadedPrefixesCount: number
    loadedTermsCount: number
  }
}

function enrichPrefixSpecificData (
  searchArrayByPrefix: Record<string, TermEntry[]>,
  prefixEndpointData: Record<string, PrefixEndpointData>
): void {
  for (const [prefix, terms] of Object.entries(searchArrayByPrefix)) {
    const data: PrefixEndpointData = { otherTypes: [] }
    prefixEndpointData[prefix] = data

    for (const term of terms) {
      if (!term.prefixed.startsWith(prefix)) {
        // for instance if the ontology `foo:` contains triples indicating its author:
        //          <http://example.com/me> rdf:type foaf:Person .
        // we want to filter it out.
        continue
      }
      const termToAdd: PrefixTermSummary = {
        itemText: term.itemText,
        iri: term.iri,
        label: term.label,
        prefixed: term.prefixed
      }

      // some terms have several types
      const typeParts = term.parts.filter(({ predicate }) => predicate === 'rdf:type')

      for (const typePart of typeParts) {
        const type = typePart.object
        if (typeof type !== 'string') {
          // a literal or blank node as `rdf:type`: not a type we can group by
          continue
        }

        if (type.startsWith('http://') || type.startsWith('https://')) {
          data.otherTypes.push(type)
          continue
        }

        const group = data[type] as PrefixTermSummary[] | undefined
        if (group) {
          group.push(termToAdd)
        }
        else {
          data[type] = [termToAdd]
        }
      }
    }

    for (const type of Object.keys(data)) {
      if (type !== 'otherTypes') {
        data[type] = sortBy(data[type] as PrefixTermSummary[], 'prefixed')
      }
    }
  }
}

function createSearchArray (datasets: Datasets, prefixMetadata: Record<string, PrefixMetadata>): SearchArrays {
  let loadedPrefixesCount = 0
  let loadedTermsCount = 0
  const searchArrayByPrefix: Record<string, TermEntry[]> = {}
  const prefixEndpointData: Record<string, PrefixEndpointData> = {}
  const summary: SummaryEntry[] = []

  // list all quads from all datasets
  const quads: Quad[] = []
  for (const [prefix, dataset] of Object.entries(datasets)) {
    // some prefix datasets define triples that should not be part of the prefix, for instance we should only
    // care about triples from `frbr:` for which the subject IRI actually starts with `http://purl.org/vocab/frbr/core#`,
    // which unfortunately isn't always the case:
    // https://github.com/zazuko/rdf-vocabularies/blob/3027a5c5aedf0bf0439d68d779856ace9c57b3f7/ontologies/frbr.nq#L348-L350
    const namespace = prefixes[prefix] ?? ''
    const filtered = [...dataset.filter(({ subject }) => subject.value.startsWith(namespace))]

    if (filtered.length > 0) {
      loadedPrefixesCount += 1
      loadedTermsCount += filtered.length
    }

    summary.push({
      prefix,
      terms: filtered.length
    })
    quads.push(...filtered)
  }

  const entries: TermEntry[] = []
  const indexBySubject = new Map<string, number>()
  for (const quad of quads) {
    const predicateIRI = quad.predicate.value
    const objectIRI = quad.object.termType === 'NamedNode' ? quad.object.value : undefined
    const part: TermPart = {
      predicate: cachedShrink(predicateIRI),
      predicateIRI,
      object: objectIRI !== undefined ? cachedShrink(objectIRI) : quad.object,
      objectIRI,
      quad
    }

    const subjectKey = `${quad.subject.termType}:${quad.subject.value}`
    const index = indexBySubject.get(subjectKey)
    const existing = index !== undefined ? entries[index] : undefined
    if (existing) {
      existing.parts.push(part)
      continue
    }

    const prefixed = cachedShrink(quad.subject.value)
    const [prefixedSplitA = '', prefixedSplitB] = prefixed.split(':')
    // see https://github.com/zazuko/prefix-server/issues/26
    const iriSplitA = prefixedSplitB ? (quad.subject.value.split(prefixedSplitB)[0] ?? '') : quad.subject.value
    const ontologyTitle = prefixMetadata[prefixedSplitA]?.title ?? ''

    indexBySubject.set(subjectKey, entries.length)
    entries.push({
      iri: quad.subject,
      prefixed,
      graph: quad.graph,
      parts: [part],
      prefixedSplitA,
      prefixedSplitB,
      iriSplitA,
      iriSplitB: prefixedSplitB,
      ontologyTitle,
      // declared here so that the JSON key order matches the historical data files
      label: undefined,
      itemText: prefixed
    })
  }

  const searchArray = entries.map((term) => {
    const labels: Record<string, string> = {}
    const noLanguage: string[] = []
    for (const part of term.parts) {
      if (!part.predicateIRI || !labelPredicates.includes(part.predicateIRI)) {
        continue
      }
      const object = part.object
      if (typeof object !== 'string' && typeof object.language === 'string') {
        labels[object.language] = object.value
      }
      else {
        noLanguage.push(typeof object === 'string' ? object : object.value)
      }
    }

    // choose the best label to display
    if (labels.en) {
      // 1st priority is English
      term.label = labels.en
    }
    else if (labels['']) {
      // sometimes the English label has an empty language
      term.label = labels['']
    }
    else if (noLanguage.length) {
      // last resort, a label with no specified language
      term.label = noLanguage.join('\n')
    }

    term.itemText = term.prefixed
    if (term.label) {
      term.itemText += ` (${term.label})`
    }

    // create the prefix-specific search array
    const group = searchArrayByPrefix[term.prefixedSplitA]
    if (group) {
      group.push(term)
    }
    else {
      searchArrayByPrefix[term.prefixedSplitA] = [term]
    }

    return term
  })

  return {
    summary: sortBy(summary, 'prefix'),
    searchArray,
    searchArrayByPrefix,
    prefixEndpointData,
    stats: {
      loadedPrefixesCount,
      loadedTermsCount
    }
  }
}

function findPrefixMetadata (datasets: Datasets, index: DatasetCore): Record<string, PrefixMetadata> {
  const output: Record<string, PrefixMetadata> = {}
  for (const prefix of Object.keys(datasets)) {
    const subject = rdf.namedNode(`https://prefix.zazuko.com/${prefix}:`)
    const [title] = index.match(subject, rdf.namedNode('http://purl.org/dc/terms/title'))
    const [description] = index.match(subject, rdf.namedNode('http://purl.org/dc/terms/description'))

    output[prefix] = {
      namespace: prefixes[prefix] ?? '',
      title: title?.object.value ?? '',
      description: description?.object.value ?? ''
    }
  }
  return output
}

function preparePrefixComplete (searchArrayByPrefix: Record<string, TermEntry[]>): PrefixComplete {
  const prefixComplete: PrefixComplete = {}
  for (const [prefix, terms] of Object.entries(searchArrayByPrefix)) {
    const vocab: Record<string, string[]> = {}
    prefixComplete[prefix] = vocab
    for (const term of terms) {
      const types: string[] = []
      for (const { predicate, object } of term.parts) {
        if (predicate === 'rdf:type' && typeof object === 'string') {
          types.push(object)
        }
      }
      vocab[term.prefixedSplitB ?? ''] = types
    }
  }
  return prefixComplete
}

export async function prepareData (): Promise<DataFiles> {
  const now = Date.now()

  const datasets = await vocabularies() as Datasets
  const index = await meta()
  const prefixMetadata = findPrefixMetadata(datasets, index)

  const {
    summary,
    searchArray,
    searchArrayByPrefix,
    prefixEndpointData,
    stats
  } = createSearchArray(datasets, prefixMetadata)
  enrichPrefixSpecificData(searchArrayByPrefix, prefixEndpointData)

  const prefixComplete = preparePrefixComplete(searchArrayByPrefix)

  debug(`API data generated in ${Date.now() - now}ms, loaded ${stats.loadedPrefixesCount} prefixes for a total of ${stats.loadedTermsCount} triples`)

  return {
    searchArray,
    searchArrayByPrefix,
    prefixMetadata,
    prefixEndpointData,
    summary,
    prefixComplete
  }
}
