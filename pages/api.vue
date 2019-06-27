<template>
  <div class="main-container">
    <div class="default-content">
      <div class="layout-width">
        <section class="md-content">
          <div class="content default">
            <h1 id="api-intro">
              RDF Prefix Resolve API
            </h1>

            <p>We provide two API endpoints:</p>

            <ul>
              <li><a href="#expand-endpoint"><code>/api/v1/expand?q=…</code></a></li>
              <li><a href="#shrink-endpoint"><code>/api/v1/shrink?q=…</code></a></li>
            </ul>

            <h2 id="expand-endpoint">
              Expanding an IRI
            </h2>

            <p>
              <strong>expand</strong>ing means the following operation:<br>
              <code>'xsd:dateTime'</code>&nbsp;→
              <code>'http://www.w3.org/2001/XMLSchema#dateTime'</code>.
              <br>
              It is the opposite of <a href="#shrink-endpoint"><strong>/shrink</strong></a>ing.
            </p>

            <h3>Examples</h3>
            <p>
              Success: <code>HTTP200</code>
            </p>
            <curl-example
              :url="apiUrl('/api/v1/expand', { q: 'schema:Person' })"
              :result="{success: true, value: 'http://schema.org/Person'}" />

            <p>
              Failure: <code>HTTP404</code>
            </p>
            <curl-example
              :url="apiUrl('/api/v1/expand', { q: 'hello:World' })"
              :result="{success: false}" />

            <h2 id="shrink-endpoint">
              Shrinking an IRI
            </h2>

            <p>
              <strong>shrink</strong>ing means the following operation:<br>
              <code>'http://www.w3.org/2001/XMLSchema#dateTime'</code>
              →&nbsp;<code>'xsd:dateTime'</code>.
              <br>
              It is the opposite of <a href="#expand-endpoint"><strong>/expand</strong></a>ing.
            </p>

            <p>
              IRI containing a <strong>#</strong>fragment such as <br><code>http://www.w3.org/2001/XMLSchema#dateTime</code>
              will have to be URI encoded:
            </p>
            <curl-example
              :url="apiUrl('/api/v1/shrink', { q: 'http://www.w3.org/2001/XMLSchema#dateTime' }, true)" />

            <h3>Examples</h3>
            <p>
              Success: <code>HTTP200</code>
            </p>
            <curl-example
              :url="apiUrl('/api/v1/shrink', { q: 'http://schema.org/Person' })"
              :result="{success: true, value: 'schema:Person'}" />

            <p>
              Failure: <code>HTTP404</code>
            </p>
            <curl-example
              :url="apiUrl('/api/v1/shrink', { q: 'http://example.org/Hello' })"
              :result="{success: false}" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import qs from 'query-string'
import CurlExample from '@/components/CurlExample'

export default {
  name: 'API',
  components: {
    CurlExample
  },
  methods: {
    apiUrl (path, query, encode = false) {
      const origin = (this.$axios.defaults.baseURL || '').replace(/\/$/, '')
      const querystring = qs.stringify(query, { encode })
      if (querystring) {
        return `${origin}${path}?${querystring}`
      }
      return `${origin}${path}`
    }
  },
  head () {
    return {
      title: 'API'
    }
  }
}
</script>
