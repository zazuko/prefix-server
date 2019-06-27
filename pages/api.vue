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
              <code>'xsd:dateTime'</code> →<br>
              <code>'http://www.w3.org/2001/XMLSchema#dateTime'</code>.
              <br>
              It is the opposite of <a href="#shrink-endpoint"><strong>/shrink</strong></a>ing.
            </p>

            <h3>Examples</h3>
            <p>
              Success: <code>HTTP200</code>
            </p>
            <pre><code>$ curl --silent \
  "https://prefix.zazuko.com/api/v1/expand?q=schema:Person" \
  | jq .
{
  "success": true,
  "value": "http://schema.org/Person"
}
</code></pre>
            <p>
              Failure: <code>HTTP404</code>
            </p>
            <pre><code>$ curl --silent \
  "https://prefix.zazuko.com/api/v1/expand?q=hello:World" \
  | jq .
{
  "success": false
}
</code></pre>

            <h2 id="shrink-endpoint">
              Shrinking an IRI
            </h2>

            <p>
              <strong>shrink</strong>ing means the following operation:<br>
              <code>'http://www.w3.org/2001/XMLSchema#dateTime'</code> → <br>
              <code>'xsd:dateTime'</code>.
              <br>
              It is the opposite of <a href="#expand-endpoint"><strong>/expand</strong></a>ing.
            </p>

            <p>
              IRI containing a <strong>#</strong>fragment such as <br><code>http://www.w3.org/2001/XMLSchema#dateTime</code>
              will have to be URI encoded:
            </p>
            <pre><code>$ curl --silent \
  "https://prefix.zazuko.com/api/v1/shrink?q=http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23dateTime" \
  | jq .
</code></pre>

            <h3>Examples</h3>
            <p>
              Success: <code>HTTP200</code>
            </p>
            <pre><code>$ curl --silent \
  "https://prefix.zazuko.com/api/v1/shrink?q=http://schema.org/Person" \
  | jq .
{
  "success": true,
  "value": "schema:Person"
}
</code></pre>
            <p>
              Failure: <code>HTTP404</code>
            </p>
            <pre><code>$ curl --silent \
  "https://prefix.zazuko.com/api/v1/shrink?q=http://example.org/Hello" \
  | jq .
{
  "success": false
}
</code></pre>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>
