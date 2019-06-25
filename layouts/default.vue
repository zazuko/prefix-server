<template>
  <div>
    <page-header />
    <nuxt />
    <page-footer />
  </div>
</template>

<script>
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
export default {
  components: {
    PageHeader,
    PageFooter
  }
}
</script>
