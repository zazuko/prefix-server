import type { SummaryEntry } from '#shared/types/api'
import { getData } from '../../utils/data'

export default defineEventHandler(async (): Promise<SummaryEntry[]> => {
  const { summary } = await getData()
  return summary
})
