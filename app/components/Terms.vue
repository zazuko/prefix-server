<template>
  <div class="terms">
    <Term v-for="(term, i) in terms" :key="i" :term="term" />
  </div>
</template>

<script setup lang="ts">
import type { TermPart } from '#shared/types/api'

defineProps<{
  terms: TermPart[]
}>()
</script>
