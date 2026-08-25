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

            <table v-show="sections.length > 1" class="toc">
              <tbody>
                <tr
                  v-for="section in sections"
                  v-show="section.terms.length"
                  :key="section.type">
                  <td>
                    <NuxtLink :to="{ hash: `#${section.anchor}` }">
                      {{ section.terms.length }}
                    </NuxtLink>
                  </td>
                  <td>
                    <NuxtLink :to="{ hash: `#${section.anchor}` }">
                      {{ section.type }}
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              v-for="section in sections"
              :id="section.anchor"
              :key="section.type">
              <h2 v-show="section.terms.length">
                {{ section.terms.length }}
                <NuxtLink :to="{ path: `/${section.type}` }">
                  <code>{{ section.type }}</code>
                </NuxtLink>
              </h2>
              <ul>
                <li
                  v-for="term in section.terms"
                  :key="term.prefixed">
                  <NuxtLink :to="{ path: `/${term.prefixed}` }">
                    {{ term.itemText }}
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <h2 v-show="otherTypes.length">
              {{ otherTypes.length }}
              other term{{ otherTypes.length > 1 ? 's' : '' }}
            </h2>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PrefixResponse, PrefixTermSummary } from '#shared/types/api'

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

const { data, error } = await useFetch<PrefixResponse | []>('/api/v1/prefix', { query: { q: prefix }, key: `prefix:${prefix}` })
const response = data.value
if (error.value || !response || Array.isArray(response)) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const { data: content, metadata } = response
const otherTypes = content.otherTypes

// the terms of the vocabulary grouped by type, e.g. `rdfs:Class`, `rdf:Property`
const sections = Object.keys(content)
  .filter(type => type !== 'otherTypes')
  .sort()
  .map(type => ({
    type,
    anchor: type.replace(':', '-').toLowerCase(),
    terms: content[type] as PrefixTermSummary[]
  }))

useHead({
  title: `RDF prefix ${prefix} lookup`
})
</script>

<style scoped>
ul {
  margin-bottom: 25px !important;
}
</style>
