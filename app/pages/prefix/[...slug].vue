<template>
  <div class="main-container">
    <div class="default-content">
      <div class="layout-width">
        <section class="md-content">
          <div class="content default">
            <h1><code>{{ prefix }}</code> RDF Prefix</h1>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <h3 v-if="metadata.title" v-html="metadata.title"></h3>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <h4 v-if="metadata.description" v-html="metadata.description"></h4>

            <h3>The <code>{{ metadata.namespace }}</code> namespace defines:</h3>

            <table v-show="sortedKeys.length > 1" class="toc">
              <tbody>
                <tr
                  v-for="prefixedType in sortedKeys"
                  v-show="content[prefixedType].length"
                  :key="prefixedType">
                  <td>
                    <NuxtLink :to="{ hash: `#${anchor(prefixedType)}` }">
                      {{ content[prefixedType].length }}
                    </NuxtLink>
                  </td>
                  <td>
                    <NuxtLink :to="{ hash: `#${anchor(prefixedType)}` }">
                      {{ prefixedType }}
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              v-for="prefixedType in sortedKeys"
              :id="anchor(prefixedType)"
              :key="prefixedType">
              <h2 v-show="content[prefixedType].length">
                {{ content[prefixedType].length }}
                <NuxtLink :to="{ path: `/${prefixedType}` }">
                  <code>{{ prefixedType }}</code>
                </NuxtLink>
              </h2>
              <ul>
                <li
                  v-for="obj in content[prefixedType]"
                  :key="obj.prefixed">
                  <NuxtLink :to="{ path: `/${obj.prefixed}` }">
                    {{ obj.itemText }}
                  </NuxtLink>
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

<script setup>
definePageMeta({
  middleware: (to) => {
    const prefix = [to.params.slug].flat().join('/')
    if (!prefix) {
      return navigateTo('/prefixes')
    }
    if (!prefix.endsWith(':')) {
      return navigateTo(`/prefix/${prefix}:`)
    }
  }
})

const route = useRoute()
const prefix = [route.params.slug].flat().join('/')

const { data, error } = await useFetch('/api/v1/prefix', { query: { q: prefix }, key: `prefix:${prefix}` })
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const { data: content, metadata } = data.value
const sortedKeys = Object.keys(content).filter(key => key !== 'otherTypes').sort()

const anchor = prefixedType => prefixedType.replace(':', '-').toLowerCase()

useHead({
  title: `RDF prefix ${prefix} lookup`
})
</script>

<style scoped>
ul {
  margin-bottom: 25px !important;
}
</style>
