/*
 * Builds the data used by the API from `@zazuko/vocabularies`.
 * Run through `npm run build-data`.
 */
import rdf from '@rdfjs/data-model'
import { prefixes, vocabularies } from '@zazuko/vocabularies'
import meta from '@zazuko/vocabularies/meta'
import createDebug from 'debug'
import { sortBy } from 'lodash-es'
import { cachedShrink } from '../server/utils/vocabularies.js'

const debug = createDebug('prefix-server')

const labelPredicates = [
  'http://www.w3.org/2000/01/rdf-schema#label',
  'http://www.w3.org/2004/02/skos/core#prefLabel'
]

function enrichPrefixSpecificData (searchArrayByPrefix, prefixEndpointData) {
  for (const prefix in searchArrayByPrefix) {
    prefixEndpointData[prefix] = {
      otherTypes: []
    }
    for (const term of searchArrayByPrefix[prefix]) {
      if (!term.prefixed.startsWith(prefix)) {
        // for instance if the ontology `foo:` contains triples indicating its author:
        //          <http://example.com/me> rdf:type foaf:Person .
        // we want to filter it out.
        continue
      }
      const termToAdd = {
        itemText: term.itemText,
        iri: term.iri,
        label: term.label,
        prefixed: term.prefixed
      }

      // some terms have several types
      const typeParts = term.parts.filter(({ predicate }) => predicate === 'rdf:type')

      for (const typePart of typeParts) {
        const type = typePart.object

        if (type.startsWith('http://') || type.startsWith('https://')) {
          prefixEndpointData[prefix].otherTypes.push(type)
          continue
        }

        if (!prefixEndpointData[prefix][type]) {
          prefixEndpointData[prefix][type] = []
        }
        prefixEndpointData[prefix][type].push(termToAdd)
      }
    }
    Object.keys(prefixEndpointData[prefix]).forEach((term) => {
      prefixEndpointData[prefix][term] = sortBy(prefixEndpointData[prefix][term], 'prefixed')
    })
  }
}

function createSearchArray (datasets, prefixMetadata) {
  let loadedPrefixesCount = 0
  let loadedTermsCount = 0
  const searchArrayByPrefix = {}
  const prefixEndpointData = {}
  const summary = []

  // list all quads from all datasets
  const quads = Object.entries(datasets)
    .reduce((acc, [prefix, dataset]) => {
      // some prefix datasets define triples that should not be part of the prefix, for instance we should only
      // care about triples from `frbr:` for which the subject IRI actually starts with `http://purl.org/vocab/frbr/core#`,
      // which unfortunately isn't always the case:
      // https://github.com/zazuko/rdf-vocabularies/blob/3027a5c5aedf0bf0439d68d779856ace9c57b3f7/ontologies/frbr.nq#L348-L350
      const filtered = [...dataset.filter(({ subject }) => subject.value.startsWith(prefixes[prefix]))]

      if (filtered.length > 0) {
        loadedPrefixesCount += 1
        loadedTermsCount += filtered.length
      }

      summary.push({
        prefix,
        terms: filtered.length
      })
      return acc.concat(filtered)
    }, [])

  const obj = []
  const indexBySubject = new Map()
  for (const quad of quads) {
    let { predicate, object } = quad
    let predicateIRI, objectIRI

    if (predicate.termType === 'NamedNode') {
      predicateIRI = predicate.value
      predicate = cachedShrink(predicate.value)
    }
    if (object.termType === 'NamedNode') {
      objectIRI = object.value
      object = cachedShrink(object.value)
    }
    const part = { predicate, predicateIRI, object, objectIRI, quad }

    const subjectKey = `${quad.subject.termType}:${quad.subject.value}`
    const index = indexBySubject.get(subjectKey)
    if (index !== undefined) {
      obj[index].parts.push(part)
    }
    else {
      const termToAdd = {
        iri: quad.subject,
        prefixed: cachedShrink(quad.subject.value),
        graph: quad.graph,
        parts: [part]
      }
      const [prefixedSplitA, prefixedSplitB] = termToAdd.prefixed.split(':')
      // see https://github.com/zazuko/prefix-server/issues/26
      const iriSplitA = prefixedSplitB ? termToAdd.iri.value.split(prefixedSplitB)[0] : termToAdd.iri.value
      const ontologyTitle = (prefixMetadata[prefixedSplitA] && prefixMetadata[prefixedSplitA].title) || ''
      Object.assign(termToAdd, {
        prefixedSplitA,
        prefixedSplitB,
        iriSplitA,
        iriSplitB: prefixedSplitB,
        ontologyTitle
      })

      indexBySubject.set(subjectKey, obj.length)
      obj.push(termToAdd)
    }
  }

  const searchArray = obj.map((term) => {
    const labels = term.parts.reduce((labels, part) => {
      if (labelPredicates.includes(part.predicateIRI)) {
        const language = part.object.language
        if (typeof language === 'string') {
          labels[language] = part.object.value
        }
        else {
          if (!labels['no language']) {
            labels['no language'] = []
          }
          labels['no language'].push(part.object.value)
        }
      }
      return labels
    }, {})

    // choose the best label to display
    if (labels.en) {
      // 1st priority is English
      term.label = labels.en
    }
    else if (labels['']) {
      // sometimes the English label has an empty language
      term.label = labels['']
    }
    else if (labels['no language']) {
      // last resort, a label with no specified language
      term.label = labels['no language'].join('\n')
    }

    term.itemText = term.prefixed
    if (term.label) {
      term.itemText += ` (${term.label})`
    }

    // create the prefix-specific search array
    const prefix = term.prefixedSplitA
    if (!searchArrayByPrefix[prefix]) {
      searchArrayByPrefix[prefix] = []
    }
    searchArrayByPrefix[prefix].push(term)

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

function findPrefixMetadata (datasets, index) {
  const output = {}
  Object.entries(datasets).forEach(([prefix, dataset]) => {
    const namespace = prefixes[prefix]
    const subject = rdf.namedNode(`https://prefix.zazuko.com/${prefix}:`)
    const title = [...index.match(subject, rdf.namedNode('http://purl.org/dc/terms/title'))]
    const description = [...index.match(subject, rdf.namedNode('http://purl.org/dc/terms/description'))]

    output[prefix] = {
      namespace,
      title: (title.length && title[0].object.value) || '',
      description: (description.length && description[0].object.value) || ''
    }
  })
  return output
}

function preparePrefixComplete (searchArrayByPrefix) {
  const prefixComplete = {}
  for (const prefix in searchArrayByPrefix) {
    const terms = searchArrayByPrefix[prefix]
    const obj = {}
    prefixComplete[prefix] = obj
    for (const term of terms) {
      const types = term.parts.reduce((acc, { predicate, object }) => {
        if (predicate === 'rdf:type') {
          acc.push(object)
        }
        return acc
      }, [])
      obj[term.prefixedSplitB] = types
    }
  }
  return prefixComplete
}

export async function prepareData () {
  const now = Date.now()

  const datasets = await vocabularies()
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
