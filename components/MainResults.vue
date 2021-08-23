<template>
  <section>
    <div class="big">
      <div class="line">
        <span>Defined by</span>
        <router-link
          v-show="model.ontologyTitle"
          :to="{ path: `/prefix/${model.prefixedSplitA}:` }">
          {{ model.ontologyTitle }}
        </router-link>
        <router-link
          v-show="!model.ontologyTitle"
          :to="{ path: `/prefix/${model.prefixedSplitA}:` }">
          {{ model.prefixedSplitA }}:
        </router-link>
      </div>
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
            <!-- eslint-disable-next-line vue/no-v-html -->
            {{ model.iriSplitA }} <span v-html="ExternalLink({ height: 15, width: 15 })"></span>
          </a>
        </p>
      </div>
      <div
        v-clipboard="() => `PREFIX ${model.prefixedSplitA}: <${model.iriSplitA}>`"
        v-clipboard:success="clipboardSuccesDeclaration"
        v-clipboard:error="clipboardErrorDeclaration"
        class="prefix-clipboard-container">
        <h3>
          Recommended prefix
        </h3>
        <div>
          <div class="tooltip">
            {{ clipboardDeclarationMessage }}
          </div>
          <p>
            <a>{{ model.prefixedSplitA }}:</a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ExternalLink } from 'feather-icon-literals'

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
      },
      clipboardDeclaration: {
        status: false,
        timeout: null
      },
      ExternalLink
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
    },
    clipboardDeclarationMessage () {
      if (this.clipboardDeclaration.status === 'success') {
        return 'Copied!'
      }
      if (this.clipboardDeclaration.status === 'error') {
        return 'Error'
      }
      return `Copy 'PREFIX ${this.model.prefixedSplitA}: <${this.model.iriSplitA}>'`
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
    },
    clipboardTimeoutDeclaration () {
      if (this.clipboardDeclaration.timeout !== null) {
        clearTimeout(this.clipboardDeclaration.timeout)
      }

      this.clipboardDeclaration.timeout = setTimeout(() => {
        this.clipboardDeclaration.status = false
        this.clipboardDeclaration.timeout = null
      }, 3000)
    },
    clipboardSuccesDeclaration () {
      this.clipboardDeclaration.status = 'success'
      this.clipboardTimeoutIri()
    },
    clipboardErrorDeclaration () {
      this.clipboardDeclaration.status = 'error'
      this.clipboardTimeoutIri()
    }
  }
}
</script>
