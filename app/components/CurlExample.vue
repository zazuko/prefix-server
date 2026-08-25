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
      {{ status.message }}
    </a>
    <div class="scroller">
      <div class="line">DOMAIN={{ apiBase }}</div>
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

<script setup lang="ts">
const props = withDefaults(defineProps<{
  url: string
  result?: object | null
}>(), {
  result: null
})

const config = useRuntimeConfig()
const requestURL = useRequestURL()
const copy = useTemplateRef<HTMLAnchorElement>('copy')
const status = useCopyStatus('Copy')

const apiBase = computed(() => (config.public.apiBase || requestURL.origin).replace(/\/$/, ''))
const command = computed(() => `curl --silent "${apiBase.value}${props.url}" | jq .`)
const path = computed(() => props.url.split('?')[0])
const query = computed(() => props.url.split('?').slice(1).join('?'))

function copySuccess () {
  status.success()
  copy.value?.focus()
}

function copyError () {
  status.error()
  copy.value?.focus()
}
</script>

<style scoped>
.hl {
  color: #ff7657;
}
</style>
