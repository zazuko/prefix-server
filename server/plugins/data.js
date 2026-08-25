import consola from 'consola'
import { getData } from '../utils/data.js'

/*
 * Load and index the API data at startup instead of on the first request.
 */
export default defineNitroPlugin(() => {
  const started = Date.now()
  getData()
    .then(() => consola.withTag('data').ready(`API data loaded in ${Date.now() - started}ms`))
    .catch(error => consola.withTag('data').error(error))
})
