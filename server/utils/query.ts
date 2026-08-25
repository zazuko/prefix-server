import type { H3Event } from 'h3'

/**
 * Returns a single string value for a query parameter (the first one when repeated).
 */
export function getQueryParam (event: H3Event, name: string): string | undefined {
  const value = getQuery(event)[name]
  const first = Array.isArray(value) ? value[0] : value
  return first === undefined || first === null ? undefined : String(first)
}
