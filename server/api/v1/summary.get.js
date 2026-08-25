import { getData } from '../../utils/data.js'

export default defineEventHandler(async () => {
  const { summary } = await getData()
  return summary
})
