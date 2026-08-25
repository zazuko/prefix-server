<template>
  <div></div>
</template>

<script setup lang="ts">
// target of the search form when JavaScript is disabled
definePageMeta({
  middleware: (to) => {
    const query = Array.isArray(to.query.q) ? to.query.q[0] : to.query.q
    return navigateTo(query ? `/${query}` : '/')
  }
})
</script>
