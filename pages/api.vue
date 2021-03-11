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
              <li><a href="#autocomplete-endpoint"><code>/api/v1/autocomplete?q=…</code></a></li>
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
              :url="apiPath('/api/v1/expand', { q: 'schema:Person' })"
              :result="{success: true, value: 'http://schema.org/Person'}" />

            <p>
              Failure: <code>HTTP404</code>
            </p>
            <curl-example
              :url="apiPath('/api/v1/expand', { q: 'hello:World' })"
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
              :url="apiPath('/api/v1/shrink', { q: 'http://www.w3.org/2001/XMLSchema#dateTime' }, true)" />

            <h3>Examples</h3>
            <p>
              Success: <code>HTTP200</code>
            </p>
            <curl-example
              :url="apiPath('/api/v1/shrink', { q: 'http://schema.org/Person' })"
              :result="{success: true, value: 'schema:Person'}" />

            <p>
              Failure: <code>HTTP404</code>
            </p>
            <curl-example
              :url="apiPath('/api/v1/shrink', { q: 'http://example.org/Hello' })"
              :result="{success: false}" />

            <h2 id="autocomplete-endpoint">
              Autocomplete a prefixed term
            </h2>

            <p>
              This endpoint lets you implement RDF terms autocompletion.
            </p>

            <p>
              By default, this endpoint is <strong>case-insensitive</strong> and responds with a list of prefixed terms.
              Use <code>&case=true</code> to make it <strong>case-sensitive</strong>.
              <br>
              Use <code>&expand=true</code> to make it return <strong>full IRIs</strong> instead of prefixed terms.
            </p>

            <h3>Examples</h3>

            <p>
              Autocomplete a prefix or find matching namespaces:
            </p>
            <curl-example
              :url="apiPath('/api/v1/autocomplete', {q: 'r' })"
              :result="['rdf:','rdau:','rdfa:','rdfs:','rr:','rss:']" />

            <p>
              Autocomplete a prefix or find matching namespaces:
            </p>
            <curl-example
              :url="apiPath('/api/v1/autocomplete', {q: 'rdf' })"
              :result="['rdf:','rdfa:','rdfs:']" />

            <p>
              Autocomplete the content of a namespace:
            </p>
            <curl-example
              :url="apiPath('/api/v1/autocomplete', {q: 'rdfs:' })"
              :result="['rdfs:','rdfs:Class','rdfs:Container','rdfs:ContainerMembershipProperty','…']" />

            <p>
              Autocomplete a partial term:
            </p>
            <curl-example
              :url="apiPath('/api/v1/autocomplete', {q: 'rdfs:co' })"
              :result="['rdfs:Container','rdfs:ContainerMembershipProperty','rdfs:comment']" />

            <p>
              Autocomplete a partial term, case-sensitive:
            </p>
            <curl-example
              :url="apiPath('/api/v1/autocomplete', {q: 'rdfs:co', case: 'true' })"
              :result="['rdfs:comment']" />

            <p>
              Autocomplete a partial term, case-sensitive and expanded:
            </p>
            <curl-example
              :url="apiPath('/api/v1/autocomplete', {q: 'rdfs:co', case: 'true', expand: 'true' })"
              :result="['http://www.w3.org/2000/01/rdf-schema#comment']" />

            <p>
              Autocomplete a partial term or the content of a namespace, for a given RDF type:
            </p>
            <curl-example
              :url="apiPath('/api/v1/autocomplete', {q: 'rdfs:', type: 'rdf:Property' })"
              :result="['rdfs:comment','rdfs:domain','rdfs:isDefinedBy','rdfs:label','…']" />

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
  head () {
    return {
      title: 'RDF namespace lookup API'
    }
  },
  methods: {
    apiPath (path, query, encode = false) {
      const querystring = qs.stringify(query, { encode })
      if (querystring) {
        return `${path}?${querystring}`
      }
      return `${path}`
    }
  }
}
</script>
