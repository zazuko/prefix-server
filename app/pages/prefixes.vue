<template>
  <div class="main-container">
    <div class="default-content">
      <div class="layout-width">
        <section class="md-content">
          <div class="content default">
            <h2>Available Namespaces</h2>
            <ul id="prefixes">
              <li v-for="namespace in summary" :key="namespace.prefix">
                <NuxtLink :to="{ path: `/prefix/${namespace.prefix}:` }">
                  <code>{{ namespace.prefix }}:</code>
                  {{ namespace.terms }} triples
                </NuxtLink>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SummaryEntry } from '#shared/types/api'

const { data: summary } = await useFetch('/api/v1/summary', { default: (): SummaryEntry[] => [] })

useHead({
  title: 'List of RDF Vocabularies or Namespaces'
})
</script>
