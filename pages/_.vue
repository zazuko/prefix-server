<template>
  <search :prefetched-entries="prefetchedEntries" />
</template>

<script>
import Search from '@/components/Search'

export default {
  components: {
    Search
  },
  asyncData({ $axios, params }) {
    if (params.pathMatch) {
      return $axios.get(`/api/search?q=${params.pathMatch}`)
        .then(res => ({
          prefetchedEntries: res.data
        }))
    }
    return {
      prefetchedEntries: []
    }
  }
}
</script>
