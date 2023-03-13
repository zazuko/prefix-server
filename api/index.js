const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const express = require('express')
const Fuse = require('fuse.js')
const middlewareAsync = require('middleware-async')

const { cachedShrink, cachedExpand } = require('./utils')

const loadDataFile = file =>
  JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, `./datafiles/${file}.json.gz`))))

const app = express()
const router = express.Router()

const searchArray = loadDataFile('searchArray')
const searchArrayByPrefix = loadDataFile('searchArrayByPrefix')
const prefixEndpointData = loadDataFile('prefixEndpointData')
const prefixMetadata = loadDataFile('prefixMetadata')
const summary = loadDataFile('summary')
const fuseOptions = loadDataFile('fuseOptions')
const prefixComplete = loadDataFile('prefixComplete')

const fuse = new Fuse(searchArray, fuseOptions)
Object.keys(searchArrayByPrefix).forEach((key) => {
  searchArrayByPrefix[key] = new Fuse(searchArrayByPrefix[key], fuseOptions)
})

module.exports = { path: '/api/v1', handler: app }

router.get('/search', (req, res) => {
  const query = (req.query.q || '').replace(/---hash---/g, '#').trim()

  if (!query) {
    res.json([])
    return
  }

  // detect queries like this: `skos:`, `skos:foo`
  // do not detect queries containing a URL or spaces
  if (query.split(' ').length <= 1 && query.split('.').length <= 3 && !query.includes('://')) {
    const prefix = query.split(':')[0]
    // scope the search to only this prefix
    if (searchArrayByPrefix[prefix]) {
      res.json(searchArrayByPrefix[prefix].search(query).slice(0, 10).map(({ item }) => item))
      return
    }
  }

  res.json(fuse.search(query).slice(0, 10).map(({ item }) => item))
})

router.get('/suggest', (req, res) => {
  const query = (req.query.q || '').replace(/---hash---/g, '#').trim()

  if (!query) {
    res.json([])
    return
  }

  let results

  // detect queries like this: `skos:`, `skos:foo`
  // do not detect queries containing a URL or spaces
  if (query.split(' ').length <= 1 && query.split('.').length <= 3 && !query.includes('://')) {
    const prefix = query.split(':')[0]
    // scope the search to only this prefix
    if (searchArrayByPrefix[prefix]) {
      results = searchArrayByPrefix[prefix].search(query).slice(0, 10).map(({ item }) => item)
    }
  }
  if (!results) {
    results = fuse.search(query).slice(0, 10).map(({ item }) => item)
  }

  res.json(results.map(item => item.prefixed))
})

router.get('/prefix', (req, res) => {
  const query = (req.query.q || '').trim()
  const prefix = query.split(':')[0]

  if (!prefix || !prefixEndpointData[prefix]) {
    res.status(404).json([])
    return
  }
  res.json({
    data: prefixEndpointData[prefix],
    metadata: prefixMetadata[prefix]
  })
})

router.get('/summary', (req, res) => {
  res.json(summary)
})

router.get('/shrink', middlewareAsync(async (req, res) => {
  let iri = req.query.q

  if (iri) {
    // detect URI encoded `://`
    if (iri.includes('%3A%2F%2F')) {
      iri = decodeURIComponent(iri)
    }
    const attempt = await cachedShrink({ value: iri })
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
}))

router.get('/expand', middlewareAsync(async (req, res) => {
  const prefixed = req.query.q

  if (prefixed) {
    const attempt = await cachedExpand(prefixed)
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
}))

router.get('/autocomplete', middlewareAsync(async (req, res) => {
  const { prefixes } = await import('@zazuko/vocabularies')

  const matchCase = req.query.case === 'true'
  const expand = req.query.expand === 'true'
  const query = req.query.q
  const type = req.query.type

  if (!('q' in req.query)) {
    return res.status(400).json({ help: '/api/v1/autocomplete?q=…[&type=…][&case=true][&expand]' })
  }
  if (!query.includes(':')) {
    const potentialPrefixes = Object.keys(prefixComplete)
      .filter(prefix => prefix.startsWith(query))

    if (expand) {
      return res.json(potentialPrefixes.map(item => prefixes[item]))
    }
    return res.json(potentialPrefixes.map(prefix => `${prefix}:`))
  }
  const [searchPrefix, searchTerm] = query.split(':')
  const vocab = prefixComplete[matchCase ? searchPrefix : searchPrefix.toLowerCase()]
  if (!vocab) {
    return res.status(404).json({
      success: false
    })
  }

  if (type && !type.includes(':')) {
    return res.json([])
  }
  const results = Object.entries(vocab)
    .reduce((acc, [term, types]) => {
      if (!(matchCase ? term.startsWith(searchTerm) : term.toLowerCase().startsWith(searchTerm.toLowerCase()))) {
        return acc
      }
      if (type) {
        if (types.find(t => matchCase ? t === type : t.toLowerCase() === type.toLowerCase())) {
          acc.push(`${searchPrefix}:${term}`)
        }
      }
      else {
        acc.push(`${searchPrefix}:${term}`)
      }
      return acc
    }, [])

  if (expand) {
    return res.json(await Promise.all(results.map(item => cachedExpand(item))))
  }

  res.json(results)
}))

router.get('/health', (req, res) => {
  res.json('ok')
})

app.use(router)
