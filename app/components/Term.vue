<template>
  <div class="term">
    <div v-if="language" class="language">
      {{ language }}
    </div>

    <div class="value">
      <div v-if="isExternalIRI">
        <a
          :href="value"
          target="_blank">
          {{ value }}
        </a>
      </div>
      <NuxtLink
        v-else-if="term.objectIRI && value.endsWith(':')"
        :to="{ path: `/prefix/${value}` }">
        {{ value }}
      </NuxtLink>
      <NuxtLink
        v-else-if="term.objectIRI"
        :to="{ path: `/${value}` }">
        {{ value }}
      </NuxtLink>
      <div v-else-if="isBlankNode">
        <em>blank node</em>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else v-html="xss(value)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import xss from 'xss'
import type { TermPart } from '#shared/types/api'

const props = defineProps<{
  term: TermPart
}>()

// the object is either a prefixed IRI (string) or a serialized RDF/JS term
const object = computed(() => props.term.object)

const isExternalIRI = computed(() => object.value === props.term.objectIRI)

const isBlankNode = computed(() => {
  const term = object.value
  if (typeof term === 'string') {
    return false
  }
  if (term.termType) {
    return term.termType === 'BlankNode'
  }
  return term.value.startsWith('b') && term.value.split('_').length === 2
})

const language = computed(() => {
  const term = object.value
  if (typeof term !== 'string' && typeof term.language === 'string') {
    return `lang:${term.language || '""'}`
  }
  return false
})

const value = computed(() => {
  const term = object.value
  return typeof term === 'string' ? term : term.value
})
</script>
