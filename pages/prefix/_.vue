<template>
  <div class="main-container">
    <div class="default-content">
      <div class="layout-width">
        <section class="md-content">
          <div class="content default">
            <h2><code>{{ prefix }}</code> vocabulary</h2>

            <h3>{{ content['rdfs:Class'].length }} Classes</h3>
            <ul
              v-for="obj in content['rdfs:Class']"
              id="classes"
              :key="obj.prefixed">
              <li>
                <nuxt-link :to="{ path: `/${obj.prefixed}`}">
                  {{ obj.itemText }}
                </nuxt-link>
              </li>
            </ul>

            <h3>{{ content['rdf:Property'].length }} Properties</h3>
            <ul
              v-for="obj in content['rdf:Property']"
              id="properties"
              :key="obj.prefixed">
              <li>
                <nuxt-link :to="{ path: `/${obj.prefixed}`}">
                  {{ obj.itemText }}
                </nuxt-link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ $axios, params, redirect, error }) {
    const prefix = params.pathMatch
    if (!prefix) {
      redirect('/prefixes')
      return
    }
    if (!prefix.endsWith(':')) {
      redirect(`/prefix/${prefix}:`)
      return
    }
    try {
      const content = await $axios.$get(`/api/v1/prefix?q=${prefix}`)

      return {
        prefix,
        content
      }
    }
    catch (err) {
      error({ statusCode: 404, message: 'Not Found' })
    }
  },
  head () {
    return {
      title: `RDF ${this.prefix} prefix`
    }
  }
}
</script>
