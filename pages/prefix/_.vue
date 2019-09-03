<template>
  <div class="main-container">
    <div class="default-content">
      <div class="layout-width">
        <section class="md-content">
          <div class="content default">
            <h1><code>{{ prefix }}</code> RDF Prefix</h1>
            <h3 v-if="metadata.title" v-html="metadata.title"></h3>
            <h3>Namespace: <code>{{ metadata.namespace }}</code></h3>
            <h4 v-if="metadata.description" v-html="metadata.description"></h4>

            <p>
              <em>
                What does this namespace contain?
              </em>
            </p>

            <div
              v-for="prefixedType in sortedKeys"
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

            <h2 v-show="content.otherTypes.length">
              {{ content.otherTypes.length }}
              other term{{ content.otherTypes.length > 1 ? 's' : '' }}
            </h2>
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
      const { data: content, metadata } = await $axios.$get(`/api/v1/prefix?q=${prefix}`)
      const sortedKeys = Object.keys(content).filter(key => key !== 'otherTypes')
      sortedKeys.sort()

      return {
        prefix,
        metadata,
        content,
        sortedKeys
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
