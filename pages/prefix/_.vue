<template>
  <div class="main-container">
    <div class="default-content">
      <div class="layout-width">
        <section class="md-content">
          <div class="content default">
            <h1><code>{{ prefix }}</code> RDF prefix</h1>

            <div
              v-for="prefixedType in prefixedTypes"
              :id="prefixedType.replace(':', '-').toLowerCase()"
              :key="prefixedType">
              <h2 v-show="content[prefixedType].length">
                {{ content[prefixedType].length }}
                <nuxt-link :to="{ path: `/${prefixedType}` }">
                  <code>{{ prefixedType }}</code>
                </nuxt-link>
              </h2>
              <ul>
                <li
                  v-for="obj in content[prefixedType]"
                  :key="obj.prefixed">
                  <nuxt-link :to="{ path: `/${obj.prefixed}`}">
                    {{ obj.itemText }}
                  </nuxt-link>
                </li>
              </ul>
            </div>

            <h2 v-show="content.otherTermsCount">
              {{ content.otherTermsCount }} other terms
            </h2>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
const prefixedTypes = [
  'rdfs:Class',
  'owl:Class',
  'rdf:Property',
  'owl:ObjectProperty'
]

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
        prefixedTypes,
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

<style scoped>
ul {
  margin-bottom: 25px !important;
}
</style>
