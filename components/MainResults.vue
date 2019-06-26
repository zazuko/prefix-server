<template>
  <section>
    <div class="big">
      <div
        v-clipboard="() => model.prefixed"
        v-clipboard:success="clipboardSuccesPrefixed"
        v-clipboard:error="clipboardErrorPrefixed"
        class="line"
      >
        <div class="tooltip">
          {{ clipboardPrefixedMessage }}
        </div>
        <span>{{ model.prefixedSplitA }}:</span>{{ model.prefixedSplitB }}
      </div>
      <div
        v-clipboard="() => model.iri.value"
        v-clipboard:success="clipboardSuccesIri"
        v-clipboard:error="clipboardErrorIri"
        class="line"
      >
        <div class="tooltip">
          {{ clipboardIriMessage }}
        </div>
        <span>{{ model.iriSplitA }}</span>{{ model.iriSplitB }}
      </div>
    </div>
    <div class="small">
      <div>
        <h3>
          Namespace
        </h3>
        <p>
          {{ model.iriSplitA }}
        </p>
      </div>
      <div>
        <h3>
          Recommended prefix
        </h3>
        <p>
          {{ model.prefixedSplitA }}:
        </p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MainResults',
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      clipboardPrefixed: {
        status: false,
        timeout: null
      },
      clipboardIri: {
        status: false,
        timeout: null
      }
    }
  },
  computed: {
    clipboardPrefixedMessage() {
      if (this.clipboardPrefixed.value === 'success') return 'Copied!'
      else if (this.clipboardPrefixed.value === 'error') return 'Error'
      else return 'Click to Copy'
    },
    clipboardIriMessage() {
      if (this.clipboardIri.value === 'success') return 'Copied!'
      else if (this.clipboardIri.value === 'error') return 'Error'
      else return 'Click to Copy'
    }
  },
  methods: {
    clipboardTimeoutPrefixed() {
      if (this.clipboardPrefixed.timeout !== null) {
        clearTimeout(this.clipboardPrefixed.timeout)
      }

      this.clipboardPrefixed.timeout = setTimeout(() => {
        this.clipboardPrefixed.value = false
        this.clipboardPrefixed.timeout = null
      }, 3000)
    },
    clipboardSuccesPrefixed() {
      this.clipboardPrefixed.value = 'success'
      this.clipboardTimeoutPrefixed()
    },
    clipboardErrorPrefixed() {
      this.clipboardPrefixed.value = 'error'
      this.clipboardTimeoutPrefixed()
    },
    clipboardTimeoutIri() {
      if (this.clipboardIri.timeout !== null) {
        clearTimeout(this.clipboardIri.timeout)
      }

      this.clipboardIri.timeout = setTimeout(() => {
        this.clipboardIri.value = false
        this.clipboardIri.timeout = null
      }, 3000)
    },
    clipboardSuccesIri() {
      this.clipboardIri.value = 'success'
      this.clipboardTimeoutIri()
    },
    clipboardErrorIri() {
      this.clipboardIri.value = 'error'
      this.clipboardTimeoutIri()
    }
  }
}
</script>
