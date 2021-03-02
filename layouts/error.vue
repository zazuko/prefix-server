<template>
  <div class="theme-container">
    <div class="layout-404">
      <div class="content-container">
        <h1>{{ error.statusCode }}</h1>
        <h2>There's nothing here.</h2>
        <NuxtLink to="/">
          Take me home.
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    }
  },
  head () {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
}
</script>
