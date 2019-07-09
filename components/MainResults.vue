<template>
  <section>
    <div class="big">
      <div
        v-clipboard="() => model.prefixed"
        v-clipboard:success="clipboardSuccesPrefixed"
        v-clipboard:error="clipboardErrorPrefixed"
        class="line">
        <div class="tooltip">
          {{ clipboardPrefixedMessage }}
        </div>
        <span>{{ model.prefixedSplitA }}:</span>{{ model.prefixedSplitB }}
      </div>
      <div
        v-clipboard="() => model.iri.value"
        v-clipboard:success="clipboardSuccesIri"
        v-clipboard:error="clipboardErrorIri"
        class="line">
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
          <a :href="model.iriSplitA">
            {{ model.iriSplitA }}
          </a>
        </p>
      </div>
      <div>
        <h3>
          Recommended prefix
        </h3>
        <p>
          <router-link :to="{ path: `/prefix/${model.prefixedSplitA}:` }">
            {{ model.prefixedSplitA }}:
          </router-link>
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
  data () {
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
    clipboardPrefixedMessage () {
      if (this.clipboardPrefixed.status === 'success') {
        return 'Copied!'
      }
      if (this.clipboardPrefixed.status === 'error') {
        return 'Error'
      }
      return 'Click to Copy'
    },
    clipboardIriMessage () {
      if (this.clipboardIri.status === 'success') {
        return 'Copied!'
      }
      if (this.clipboardIri.status === 'error') {
        return 'Error'
      }
      return 'Click to Copy'
    }
  },
  methods: {
    clipboardTimeoutPrefixed () {
      if (this.clipboardPrefixed.timeout !== null) {
        clearTimeout(this.clipboardPrefixed.timeout)
      }

      this.clipboardPrefixed.timeout = setTimeout(() => {
        this.clipboardPrefixed.status = false
        this.clipboardPrefixed.timeout = null
      }, 3000)
    },
    clipboardSuccesPrefixed () {
      this.clipboardPrefixed.status = 'success'
      this.clipboardTimeoutPrefixed()
    },
    clipboardErrorPrefixed () {
      this.clipboardPrefixed.status = 'error'
      this.clipboardTimeoutPrefixed()
    },
    clipboardTimeoutIri () {
      if (this.clipboardIri.timeout !== null) {
        clearTimeout(this.clipboardIri.timeout)
      }

      this.clipboardIri.timeout = setTimeout(() => {
        this.clipboardIri.status = false
        this.clipboardIri.timeout = null
      }, 3000)
    },
    clipboardSuccesIri () {
      this.clipboardIri.status = 'success'
      this.clipboardTimeoutIri()
    },
    clipboardErrorIri () {
      this.clipboardIri.status = 'error'
      this.clipboardTimeoutIri()
    }
  }
}
</script>
