const fs = require('fs')
const path = require('path')
const debug = require('debug')('prefix-server')

// only do the thing when called directly (node this-script)
if (require.main === module) {
  Promise.resolve().then(buildResources)
}

module.exports = buildResources

async function buildResources () {
  debug('preparing API data')
  const { prepareData } = require('./api/utils')
  const zlib = require('zlib')
  const extraFilePath = path.resolve(__dirname, './api/api-data.json.gz')
  const data = await prepareData()
  const gzip = zlib.gzipSync(JSON.stringify(data))
  fs.writeFileSync(extraFilePath, gzip)
  debug(`wrote API data to ${extraFilePath}`)
}
