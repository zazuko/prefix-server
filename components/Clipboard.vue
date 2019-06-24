<template>
  <button
    v-clipboard="() => toCopy"
    v-clipboard:success="clipboardSuccessHandler"
    v-clipboard:error="clipboardErrorHandler"
  >
    Copy
  </button>
</template>

<script>
export default {
  name: 'Clipboard',
  props: {
    toCopy: {
      type: String,
      required: false,
      default: ''
    }
  },
  methods: {
    clipboardSuccessHandler() {
      this.$emit('success')
    },
    clipboardErrorHandler() {
      this.$emit('error')
    }
  }
}
</script>
