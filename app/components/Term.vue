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

<script setup>
import xss from 'xss'

const props = defineProps({
  term: {
    type: Object,
    required: true
  }
})

// the object is either a prefixed IRI (string) or a serialized RDF/JS term
const object = computed(() => props.term.object)

const isExternalIRI = computed(() => object.value === props.term.objectIRI)

const isBlankNode = computed(() => {
  if (typeof object.value !== 'object' || object.value === null) {
    return false
  }
  if (object.value.termType) {
    return object.value.termType === 'BlankNode'
  }
  const { value } = object.value
  return typeof value === 'string' && value.startsWith('b') && value.split('_').length === 2
})

const language = computed(() => {
  if (typeof object.value === 'object' && object.value !== null && typeof object.value.language === 'string') {
    return `lang:${object.value.language || '""'}`
  }
  return false
})

const value = computed(() => {
  if (typeof object.value === 'object' && object.value !== null) {
    return object.value.value
  }
  return object.value
})
</script>
