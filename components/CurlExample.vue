<template>
  <code class="example">
    <a
      ref="copy"
      v-clipboard="() => command"
      v-clipboard:success="copySuccess"
      v-clipboard:error="copyError"
      href="#"
      class="copy"
      @click="e => e.preventDefault()">
      {{ copyMessage }}
    </a>
    <div class="scroller">
      <div class="line">
        curl --silent \
        <br />
        <a :href="url" target="_blank">"{{ url }}"</a> \
        <br />
        | jq .
      </div>
      <template v-if="result">
        <div class="result">{{ JSON.stringify(result, null, 2) }}</div>
      </template>
    </div>
  </code>
</template>

<script>
export default {
  name: 'CurlExample',
  props: {
    url: {
      type: String,
      required: true
    },
    result: {
      type: Object,
      default: null
    }
  },
  data () {
    return { copy: { state: false, timeout: null } }
  },
  computed: {
    command () {
      return `curl --silent ${this.url} | jq .`
    },
    copyMessage () {
      if (this.copy.state === 'success') {
        return 'Copied!'
      }
      if (this.copy.state === 'error') {
        return 'Error'
      }
      return 'Copy'
    }
  },
  methods: {
    copySuccess () {
      this.copy.state = 'success'
      this.copyTimeout()
      this.$refs.copy.focus()
    },
    copyError () {
      this.copy.state = 'error'
      this.copyTimeout()
      this.$refs.copy.focus()
    },
    copyTimeout () {
      if (this.copy.timeout !== null) {
        clearTimeout(this.copy.timeout)
      }

      this.copy.timeout = setTimeout(() => {
        this.copy.state = false
        this.copy.timeout = null
      }, 3000)
    }
  }
}
</script>
