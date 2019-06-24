<template>
  <div class="item">
    <term v-for="(term, i) in terms" :key="i" :term="term" />
  </div>
</template>

<script>
import Term from '@/components/Term'

export default {
  name: 'Terms',
  components: {
    Term
  },
  props: {
    terms: {
      type: Array,
      required: true
    }
  }
}
</script>
