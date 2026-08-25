<template>
  <div class="main">
    <PageHeader />
    <slot />
    <PageFooter />
  </div>
</template>

<script setup>
useSeoMeta({
  ogImage: 'https://prefix.zazuko.com/og-home.png'
})
</script>
