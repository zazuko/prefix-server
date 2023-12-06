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
      <div class="line">DOMAIN={{ apiBase() }}</div>
      <div class="line">
        curl --silent \
        <br />
        <a :href="url" target="_blank">"${DOMAIN}{{ path }}<span v-if="query" class="hl">?{{ query }}</span>"</a> \
        <br />
        | jq .
      </div>
      <template v-if="result">
        <div class="result">{{ JSON.stringify(result, null, 2).replace('"…"', '…') }}</div>
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
      type: [Object, Array],
      default: null
    }
  },
  data () {
    return { copy: { state: false, timeout: null } }
  },
  computed: {
    command () {
      return `curl --silent "${this.apiBase()}${this.url}" | jq .`
    },
    copyMessage () {
      if (this.copy.state === 'success') {
        return 'Copied!'
      }
      if (this.copy.state === 'error') {
        return 'Error'
      }
      return 'Copy'
    },
    path () {
      const [path] = this.url.split('?')
      return path
    },
    query () {
      const [, ...queryString] = this.url.split('?')
      return queryString.join('?')
    }
  },
  methods: {
    apiBase (path, query, encode = false) {
      const origin = (this.$axios.defaults.baseURL || '').replace(/\/$/, '')
      return origin
    },
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

<style scoped>
.hl {
  color: #ff7657;
}
</style>
