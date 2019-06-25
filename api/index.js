const express = require('express')
const Fuse = require('fuse.js')
const { vocabularies, shrink, expand, prefixes } = require('@zazuko/rdf-vocabularies')
const debug = require('debug')('prefix-server')

const app = express()
const router = express.Router()

const options = {
  treshold: 0.2,
  distance: 40,
  keys: [{
    name: 'prefixed',
    weight: 6 / 15
  }, {
    name: 'parts.object.value',
    weight: 4 / 15
  }, {
    name: 'iri.value',
    weight: 5 / 15
  }]
}

const shrunkCache = {}
const shrinkAndCache = (term) => {
  const cached = shrunkCache[term.value]
  if (cached) {
    return cached
  }
  const shrunk = shrink(term.value) || term.value
  shrunkCache[term.value] = shrunk
  return shrunk
}

const expandedCache = {}
const expandAndCache = (term) => {
  const cached = expandedCache[term.value]
  if (cached) {
    return cached
  }
  let expanded = term.value
  try {
    expanded = expand(term.value) || term.value
    expandedCache[term.value] = expanded
  } catch (err) {
    // TODO: track what people are failing to expand?
  }
  return expanded
}

(async () => {
  const summary = []
  let loadedPrefixesCount = 0
  let loadedTermsCount = 0

  const datasets = await vocabularies()
  const now = Date.now()
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
        predicate = shrinkAndCache(predicate)
      }
      if (object.termType === 'NamedNode') {
        objectIRI = object.value
        object = shrinkAndCache(object)
      }
      const part = { predicate, predicateIRI, object, objectIRI, quad }

      const index = obj.findIndex(x => x.iri.equals(quad.subject))
      if (index !== -1) {
        obj[index].parts.push(part)
      } else {
        const termToAdd = {
          iri: quad.subject,
          prefixed: shrinkAndCache(quad.subject),
          graph: quad.graph,
          parts: [part]
        }
        const [prefixedSplitA, prefixedSplitB] = termToAdd.prefixed.split(':')
        const iriSplitA = termToAdd.iri.value.split(prefixedSplitB)[0]
        Object.assign(termToAdd, { prefixedSplitA, prefixedSplitB, iriSplitA, iriSplitB: prefixedSplitB })

        termToAdd.itemText = `${termToAdd.prefixed} ― ${termToAdd.iri.value}`
        if (!termToAdd.prefixed.endsWith(':')) {
          obj.push(termToAdd)
        }
      }
      return obj
    }, [])
  debug(`API ready in ${Date.now() - now}ms, loaded ${loadedPrefixesCount} prefixes for a total of ${loadedTermsCount} triples`)

  router.get('/search', (req, res) => {
    const searchVal = (req.query.q || '').replace(/---hash---/g, '#')

    if (searchVal) {
      // possible optimization: find the prefix by finding a colon in the search string,
      // then scope the search to this prefix only
      const fuse = new Fuse(searchArray, options)
      const searchResult = fuse.search(searchVal).slice(0, 25)
      res.json(searchResult)
      return
    }

    res.json([])
  })

  router.get('/summary', (req, res) => {
    res.json(summary)
  })

  router.get('/shrink', (req, res) => {
    let iri = req.query.q

    if (iri) {
      if (iri.includes('%3A%2F%2F')) {
        iri = decodeURIComponent(iri)
      }
      const attempt = shrinkAndCache({ value: iri })
      if (attempt !== iri) {
        return res.json({
          success: true,
          value: attempt
        })
      }
      return res.status(404).json({
        success: false
      })
    }

    res.status(400).json({ help: '/api/v1/shrink?q=…' })
  })

  router.get('/expand', (req, res) => {
    const prefixed = req.query.q

    if (prefixed) {
      const attempt = expandAndCache({ value: prefixed })
      if (attempt !== prefixed) {
        return res.json({
          success: true,
          value: attempt
        })
      }
      return res.status(404).json({
        success: false
      })
    }

    res.status(400).json({ help: '/api/v1/expand?q=…' })
  })

  router.get('/health', (req, res) => {
    res.json('ok')
  })

  app.use(router)
})()

module.exports = { path: '/api/v1', handler: app }
