/**
 * Returns a single string value for a query parameter (the first one when repeated).
 */
export function getQueryParam (event, name) {
  const value = getQuery(event)[name]
  return Array.isArray(value) ? value[0] : value
}
