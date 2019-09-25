// only do the thing when called directly (node this-script)
if (require.main === module) {
  Promise.resolve().then(buildResources)
}

module.exports = buildResources

async function buildResources () {
  const debug = require('debug')('prefix-server')
  const path = require('path')
  const fs = require('fs')
  const { promisify } = require('util')
  const zlib = require('zlib')
  const writeFile = promisify(fs.writeFile)
  const gzip = promisify(zlib.gzip)

  debug('preparing API data')
  const { prepareData } = require('./api/utils')

  const {
    searchArray,
    searchArrayByPrefix,
    prefixEndpointData,
    prefixMetadata,
    summary,
    fuseOptions
  } = await prepareData()

  const fileNames = Object.entries({
    searchArray,
    searchArrayByPrefix,
    prefixEndpointData,
    prefixMetadata,
    summary,
    fuseOptions
  })

  for (const [key, val] of fileNames) {
    const extraFilePath = path.resolve(__dirname, `./api/datafiles/${key}.json.gz`)
    const compressed = await gzip(JSON.stringify(val))
    await writeFile(extraFilePath, compressed)
    debug(`wrote API data to ${extraFilePath}`)
  }
}
