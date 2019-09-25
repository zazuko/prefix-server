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
  const {
    searchArray,
    searchArrayByPrefix,
    prefixEndpointData,
    prefixMetadata,
    summary,
    fuseOptions
  } = await prepareData()

  Object.entries({
    searchArray,
    searchArrayByPrefix,
    prefixEndpointData,
    prefixMetadata,
    summary,
    fuseOptions
  }).forEach(([key, val]) => {
    const extraFilePath = path.resolve(__dirname, `./api/datafiles/${key}.json.gz`)
    const gzip = zlib.gzipSync(JSON.stringify(val))
    fs.writeFileSync(extraFilePath, gzip)
    debug(`wrote API data to ${extraFilePath}`)
  })
}
