const _ = require('lodash')
const debug = require('debug')('prefix-server')
const hash = require('string-hash')

const { vocabularies, prefixes } = require('@zazuko/rdf-vocabularies')
const { shrink, expand } = require('@zazuko/rdf-vocabularies')

const labelPredicates = [
  'http://www.w3.org/2000/01/rdf-schema#label',
  'http://www.w3.org/2004/02/skos/core#prefLabel'
]

module.exports = {
  etag,
  cachedShrink,
  cachedExpand,
  prepareData
}

const shrunkCache = {}
const expandedCache = {}
const fuseOptions = {
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

function cachedShrink (term) {
  const cached = shrunkCache[term.value]
  if (cached) {
    return cached
  }
  const shrunk = shrink(term.value) || term.value
  shrunkCache[term.value] = shrunk
  return shrunk
}

function cachedExpand (term) {
  const cached = expandedCache[term.value]
  if (cached) {
    return cached
  }
  let expanded = term.value
  try {
    expanded = expand(term.value) || term.value
    expandedCache[term.value] = expanded
  }
  catch (err) {
    //
  }
  return expanded
}

function enrichPrefixSpecificData (searchArrayByPrefix, prefixEndpointData) {
  const prefixedEndpointPredicates = ['rdfs:Class', 'owl:Class', 'rdf:Property', 'owl:ObjectProperty']

  for (const prefix in searchArrayByPrefix) {
    prefixEndpointData[prefix] = {
      'rdfs:Class': [],
      'owl:Class': [],
      'rdf:Property': [],
      'owl:ObjectProperty': [],
      otherTermsCount: 0
    }
    searchArrayByPrefix[prefix].forEach((term) => {
      const termToAdd = {
        itemText: term.itemText,
        iri: term.iri,
        label: term.label,
        prefixed: term.prefixed
      }
      const typePart = term.parts.find(({ predicate }) => predicate === 'rdf:type')
      if (!typePart || !prefixedEndpointPredicates.includes(typePart.object)) {
        prefixEndpointData[prefix].otherTermsCount += 1
        return
      }

      prefixEndpointData[prefix][typePart.object].push(termToAdd)
    })
    prefixEndpointData[prefix]['rdfs:Class'] = _.sortBy(prefixEndpointData[prefix]['rdfs:Class'], 'prefixed')
    prefixEndpointData[prefix]['owl:Class'] = _.sortBy(prefixEndpointData[prefix]['owl:Class'], 'prefixed')
    prefixEndpointData[prefix]['rdf:Property'] = _.sortBy(prefixEndpointData[prefix]['rdf:Property'], 'prefixed')
    prefixEndpointData[prefix]['owl:ObjectProperty'] = _.sortBy(prefixEndpointData[prefix]['owl:ObjectProperty'], 'prefixed')
  }
}

function createSearchArray (datasets) {
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
      const filtered = dataset.filter(({ subject }) => subject.value.startsWith(prefixes[prefix])).toArray()

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

  const searchArray = quads
    .reduce((obj, quad) => {
      let { predicate, object } = quad
      let predicateIRI, objectIRI

      if (predicate.termType === 'NamedNode') {
        predicateIRI = predicate.value
        predicate = cachedShrink(predicate)
      }
      if (object.termType === 'NamedNode') {
        objectIRI = object.value
        object = cachedShrink(object)
      }
      const part = { predicate, predicateIRI, object, objectIRI, quad }

      const index = obj.findIndex(x => x.iri.equals(quad.subject))
      if (index !== -1) {
        obj[index].parts.push(part)
      }
      else {
        const termToAdd = {
          iri: quad.subject,
          prefixed: cachedShrink(quad.subject),
          graph: quad.graph,
          parts: [part]
        }
        const [prefixedSplitA, prefixedSplitB] = termToAdd.prefixed.split(':')
        const iriSplitA = termToAdd.iri.value.split(prefixedSplitB)[0]
        Object.assign(termToAdd, { prefixedSplitA, prefixedSplitB, iriSplitA, iriSplitB: prefixedSplitB })

        obj.push(termToAdd)
      }
      return obj
    }, [])
    .map((term) => {
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
        // ―
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

  enrichPrefixSpecificData(searchArrayByPrefix, prefixEndpointData)

  return {
    summary: _.sortBy(summary, 'prefix'),
    searchArray,
    searchArrayByPrefix,
    prefixEndpointData,
    stats: {
      loadedPrefixesCount,
      loadedTermsCount
    }
  }
}

async function prepareData () {
  const now = Date.now()

  const datasets = await vocabularies()

  const {
    summary,
    searchArray,
    searchArrayByPrefix,
    prefixEndpointData,
    stats
  } = createSearchArray(datasets)

  debug(`API data generated in ${Date.now() - now}ms, loaded ${stats.loadedPrefixesCount} prefixes for a total of ${stats.loadedTermsCount} triples`)

  return {
    searchArray,
    searchArrayByPrefix,
    prefixEndpointData,
    summary,
    fuseOptions
  }
}

function etag (version) {
  return (req, res, next) => {
    const resource = `${version}:${req.originalUrl}`
    res.setHeader('ETag', hash(resource).toString(16))
    next()
  }
}
