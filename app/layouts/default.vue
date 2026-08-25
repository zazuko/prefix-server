<template>
  <div class="main">
    <PageHeader />
    <slot />
    <PageFooter />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  ogImage: 'https://prefix.zazuko.com/og-home.png'
})
</script>
