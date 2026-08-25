<template>
  <div class="terms">
    <Term v-for="(term, i) in terms" :key="i" :term="term" />
  </div>
</template>

<script setup>
defineProps({
  terms: {
    type: Array,
    required: true
  }
})
</script>
