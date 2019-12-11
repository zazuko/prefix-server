<template>
  <div class="main">
    <page-header />
    <nuxt />
    <page-footer />
  </div>
</template>

<script>
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import ogImage from '@/static/og-home.png'

export default {
  components: {
    PageHeader,
    PageFooter
  },
  head () {
    return {
      meta: [
        { hid: 'og:image', property: 'og:image', content: `https://prefix.zazuko.com${ogImage}` }
      ]
    }
  }
}
</script>
