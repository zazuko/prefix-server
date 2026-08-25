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

<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: null
  }
})

useHead({
  title: props.error && props.error.statusCode === 404 ? '404 Not Found' : 'An error occurred'
})
</script>
