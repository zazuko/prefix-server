<template>
  <div class="predicate">
    <span v-if="isIRI" class="iri">
      <a
        :href="term"
        target="_blank"
      >
        {{ term }}
      </a>
    </span>
    <span v-else>
      <router-link :to="{ path: `/${term}` }">
        <span class="prefix">
          {{ prefixSplitA }}
        </span>
        <span class="term">
          {{ prefixSplitB }}
        </span>
      </router-link>
    </span>
  </div>
</template>

<script>
export default {
  name: 'Predicate',
  props: {
    term: {
      type: String,
      required: true
    }
  },
  computed: {
    isIRI() {
      return this.term.includes('://')
    },
    prefixSplitA() {
      return this.term.split(':')[0] + ':'
    },
    prefixSplitB() {
      return this.term.split(':')[1]
    }
  }
}
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
