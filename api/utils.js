const _ = require('lodash')
const Fuse = require('fuse.js')
const debug = require('debug')('prefix-server')

const { vocabularies, prefixes } = require('@zazuko/rdf-vocabularies')
const { shrink, expand } = require('@zazuko/rdf-vocabularies')

module.exports = {
  cachedShrink,
  cachedExpand,
  initializeData
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

async function initializeData () {
  const now = Date.now()
  let summary = []
  let loadedPrefixesCount = 0
  let loadedTermsCount = 0

  const datasets = await vocabularies()
  const searchArrayByPrefix = {}
  const prefixEndpointData = {}
  const prefixedEndpointPredicates = ['rdfs:Class', 'rdf:Property']

  const searchArray = Object.entries(datasets)
    .reduce((acc, [prefix, dataset]) => {
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
        if (part.predicateIRI === 'http://www.w3.org/2000/01/rdf-schema#label') {
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

  const fuse = new Fuse(searchArray, fuseOptions)
  for (const prefix in searchArrayByPrefix) {
    prefixEndpointData[prefix] = {
      'rdfs:Class': [],
      'rdf:Property': []
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
        return
      }

      prefixEndpointData[prefix][typePart.object].push(termToAdd)
    })
    prefixEndpointData[prefix]['rdfs:Class'] = _.sortBy(prefixEndpointData[prefix]['rdfs:Class'], 'prefixed')
    prefixEndpointData[prefix]['rdf:Property'] = _.sortBy(prefixEndpointData[prefix]['rdf:Property'], 'prefixed')

    searchArrayByPrefix[prefix] = new Fuse(searchArrayByPrefix[prefix], fuseOptions)
  }
  summary = _.sortBy(summary, 'prefix')
  debug(`API ready in ${Date.now() - now}ms, loaded ${loadedPrefixesCount} prefixes for a total of ${loadedTermsCount} triples`)

  return {
    fuse,
    searchArrayByPrefix,
    prefixEndpointData,
    summary
  }
}
