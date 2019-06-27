<template>
  <div class="main-container">
    <div class="default-content">
      <div class="layout-width">
        <section class="md-content">
          <div class="content default">
            <h1 id="about">
              About Prefix Server
            </h1>

            <p>
              This service fills a gap between services like
              <a href="https://prefix.cc/">prefix.cc</a>
              and
              <a href="https://lov.linkeddata.es/">LOV</a>

              or looking up the original vocabulary specification. Not all
              vocabularies (or schema or ontology, whatever you want to call them)
              provide an HTML view. If you resolve some of the common prefixes all
              you get back is some RDF serialization which is not ideal.
            </p>

            <p>Use this service to</p>

            <ul>
              <li>
                Look up the RDF specification of a particular term
              </li>
              <li>
                Get some ideas of what classes and properties you could use by searching for
                keywords in our full-text index
              </li>
            </ul>

            <p>
              This service is opinionated, it is based on a selected list of
              vocabularies with fix prefixes maintained in
              <a href="https://github.com/zazuko/rdf-vocabularies">a separate GitHub repository</a>.
              If you would like to add additional vocabularies to the service, either create an
              <a href="https://github.com/zazuko/rdf-vocabularies#adding-new-prefixes">issue and pull-request</a>
              on the vocabulary repository or
              <a href="https://github.com/zazuko/prefix-server">fork the service</a>
              and run your own instance.
            </p>

            <p>
              This service is created and maintained by
              <a href="http://zazuko.com">Zazuko</a>,
              your trusted partner for everything around knowledge graphs, linked data, and RDF.
            </p>

            <p>Made with &hearts; in Europe. Pull requests are welcome!</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>
