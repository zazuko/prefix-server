<template>
  <div></div>
</template>

<script setup>
// target of the search form when JavaScript is disabled
definePageMeta({
  middleware: to => navigateTo(to.query.q ? `/${to.query.q}` : '/')
})
</script>
