<template>
  <search :prefetched-entries="prefetchedEntries" />
</template>

<script>
import Search from '@/components/Search'

export default {
  components: {
    Search
  },
  async asyncData({ $axios, params, error }) {
    let entries = []
    if (params.pathMatch) {
      const val = `${params.pathMatch}`.replace(/#/g, '---hash---')
      entries = await $axios.$get(`/api/search?q=${val}`)
      if (!entries.length) {
        return error({ statusCode: 404, message: 'No Result' })
      }
    }
    return {
      prefetchedEntries: entries
    }
  },
  validate({ params }) {
    if (params.pathMatch && params.pathMatch.endsWith(':')) {
      return false
    }
    return true
  }
}
</script>
