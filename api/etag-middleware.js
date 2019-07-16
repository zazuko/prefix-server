const express = require('express')
const preconditions = require('express-preconditions')
const hash = require('string-hash')

const app = express()

app.use(etag(process.env.APP_VERSION || ''))
app.use(preconditions())

function etag (version) {
  return (req, res, next) => {
    const resource = `${version}:${req.originalUrl}`
    res.setHeader('ETag', hash(resource).toString(16))
    next()
  }
}

module.exports = app
