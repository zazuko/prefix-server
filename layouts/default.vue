<template>
  <div class="main">
    <a href="https://github.com/zazuko/prefix-server">
      <img
        width="139"
        height="100"
        src="~/static/github-ribbon.png"
        class="ribbon"
        alt="Fork me on GitHub">
    </a>
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
