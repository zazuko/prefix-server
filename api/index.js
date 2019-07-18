const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const express = require('express')
const Fuse = require('fuse.js')

const { cachedShrink, cachedExpand } = require('./utils')

const app = express()
const router = express.Router()
const data = zlib.gunzipSync(fs.readFileSync(path.join(__dirname, './api-data.json.gz')))
const {
  searchArray,
  searchArrayByPrefix,
  prefixEndpointData,
  summary,
  fuseOptions
} = JSON.parse(data)

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
      res.json(searchArrayByPrefix[prefix].search(query).slice(0, 10))
      return
    }
  }

  res.json(fuse.search(query).slice(0, 10))
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
      results = searchArrayByPrefix[prefix].search(query).slice(0, 10)
    }
  }
  if (!results) {
    results = fuse.search(query).slice(0, 10)
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
  res.json(prefixEndpointData[prefix])
})

router.get('/summary', (req, res) => {
  res.json(summary)
})

router.get('/shrink', (req, res) => {
  let iri = req.query.q

  if (iri) {
    // detect URI encoded `://`
    if (iri.includes('%3A%2F%2F')) {
      iri = decodeURIComponent(iri)
    }
    const attempt = cachedShrink({ value: iri })
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
    const attempt = cachedExpand({ value: prefixed })
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
