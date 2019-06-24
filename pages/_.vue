<template>
  <search :prefetched-entries="prefetchedEntries" />
</template>

<script>
import Search from '@/components/Search'

export default {
  components: {
    Search
  },
  async asyncData({ $axios, params }) {
    let entries = []
    if (params.pathMatch) {
      entries = await $axios.$get(`/api/search?q=${params.pathMatch}`)
    }
    return {
      prefetchedEntries: entries
    }
  }
}
</script>
