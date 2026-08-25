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

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

useHead({
  title: props.error.statusCode === 404 ? '404 Not Found' : 'An error occurred'
})
</script>
