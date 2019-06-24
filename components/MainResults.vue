<template>
  <section>
    <v-alert
      :value="copySuccess"
      type="success"
      dismissible
      transition="scale-transition"
    >
      Copied!
    </v-alert>
    <v-alert
      :value="copyFailure"
      type="error"
      dismissible
      transition="scale-transition"
    >
      Could not copy to clipboard, sorry!
    </v-alert>
    <div class="big">
      <p>
        <span class="partA">{{ model.prefixedSplitA }}:</span>
        <span class="partB">{{ model.prefixedSplitB }}</span>
      </p>
      <p>
        <clipboard
          v-if="model"
          :to-copy="model.iri.value"
          @success="clipboardSuccessHandler"
          @error="clipboardErrorHandler"
        />
        <span class="partA">{{ model.iriSplitA }}</span>
        <span class="partB">{{ model.iriSplitB }}</span>
      </p>
    </div>
    <div class="small">
      <div>
        <h3>
          Namespace
        </h3>
        {{ model.iriSplitA }}
      </div>
      <div>
        <h3>
          Recommended prefix
        </h3>
        {{ model.prefixedSplitA }}:
      </div>
    </div>
  </section>
</template>

<script>
import Clipboard from '@/components/Clipboard'

export default {
  name: 'MainResults',
  components: {
    Clipboard
  },
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      copySuccess: false,
      copyFailure: false
    }
  },
  methods: {
    clipboardSuccessHandler() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2000)
    },
    clipboardErrorHandler() {
      this.copyFailure = true
      setTimeout(() => {
        this.copyFailure = false
      }, 2000)
    }
  }
}
</script>
