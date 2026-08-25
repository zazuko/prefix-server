import consola from 'consola'
import { getData } from '../utils/data'

/*
 * Load and index the API data at startup instead of on the first request.
 */
export default defineNitroPlugin(() => {
  const logger = consola.withTag('data')
  const started = Date.now()
  getData()
    .then(() => logger.ready(`API data loaded in ${Date.now() - started}ms`))
    .catch(error => logger.error(error))
})
