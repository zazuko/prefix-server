<template>
  <v-layout
    v-if="toCopy"
    row
    wrap
  >
    <v-flex
      xs12
      text-xs-center
    >
      <v-text-field
        box
        :readonly="true"
        :value="toCopy"
      >
        <template v-slot:append>
          <v-btn
            v-clipboard="() => toCopy"
            v-clipboard:success="clipboardSuccessHandler"
            v-clipboard:error="clipboardErrorHandler"
            color="primary"
          >
            Copy to clipboard
          </v-btn>
        </template>
      </v-text-field>
    </v-flex>
  </v-layout>
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
