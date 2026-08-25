/*
 * Generates the data files used by the API into `server/assets/datafiles`.
 * They are bundled into the server output by `nuxt build` as server assets.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import zlib from 'node:zlib'
import createDebug from 'debug'
import { prepareData } from './scripts/prepare-data.ts'

const debug = createDebug('prefix-server')
const gzip = promisify(zlib.gzip)
const outputDir = path.resolve(import.meta.dirname, 'server/assets/datafiles')

debug('preparing API data')
const dataFiles = await prepareData()

await mkdir(outputDir, { recursive: true })
for (const [name, data] of Object.entries(dataFiles)) {
  const file = path.join(outputDir, `${name}.json.gz`)
  await writeFile(file, await gzip(JSON.stringify(data)))
  debug(`wrote API data to ${file}`)
}
