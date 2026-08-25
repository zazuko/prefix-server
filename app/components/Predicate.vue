<template>
  <div class="predicate">
    <span v-if="isIRI" class="iri">
      <a
        :href="term"
        target="_blank">
        {{ term }}
      </a>
    </span>
    <span v-else>
      <NuxtLink :to="{ path: `/${term}` }">
        <span class="prefix">
          {{ prefixSplitA }}
        </span>
        <span class="term">
          {{ prefixSplitB }}
        </span>
      </NuxtLink>
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  term: {
    type: String,
    required: true
  }
})

const isIRI = computed(() => props.term.includes('://'))
const prefixSplitA = computed(() => `${props.term.split(':')[0]}:`)
const prefixSplitB = computed(() => props.term.split(':')[1])
</script>

<style lang="scss" scoped>
.predicate {
  a {
    color: black;
  }
  .prefix {
    color: rgba(0,0,0,0.60);
  }
  .term {
    margin-left: -4px;
  }
}
</style>
