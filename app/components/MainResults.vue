<template>
  <section>
    <div class="big">
      <div class="line">
        <span>Defined by</span>
        <NuxtLink
          v-show="model.ontologyTitle"
          :to="{ path: `/prefix/${model.prefixedSplitA}:` }">
          {{ model.ontologyTitle }}
        </NuxtLink>
        <NuxtLink
          v-show="!model.ontologyTitle"
          :to="{ path: `/prefix/${model.prefixedSplitA}:` }">
          {{ model.prefixedSplitA }}:
        </NuxtLink>
      </div>
      <div
        v-clipboard="() => model.prefixed"
        v-clipboard:success="prefixedStatus.success"
        v-clipboard:error="prefixedStatus.error"
        class="line">
        <div class="tooltip">
          {{ prefixedStatus.message }}
        </div>
        <span>{{ model.prefixedSplitA }}:</span>{{ model.prefixedSplitB }}
      </div>
      <div
        v-clipboard="() => model.iri.value"
        v-clipboard:success="iriStatus.success"
        v-clipboard:error="iriStatus.error"
        class="line">
        <div class="tooltip">
          {{ iriStatus.message }}
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
        v-clipboard="() => declaration"
        v-clipboard:success="declarationStatus.success"
        v-clipboard:error="declarationStatus.error"
        class="prefix-clipboard-container">
        <h3>
          Recommended prefix
        </h3>
        <div>
          <div class="tooltip">
            {{ declarationStatus.message }}
          </div>
          <p>
            <a>{{ model.prefixedSplitA }}:</a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ExternalLink } from 'feather-icon-literals'

const props = defineProps({
  model: {
    type: Object,
    required: true
  }
})

const declaration = computed(() => `PREFIX ${props.model.prefixedSplitA}: <${props.model.iriSplitA}>`)

const prefixedStatus = useCopyStatus('Click to Copy')
const iriStatus = useCopyStatus('Click to Copy')
const declarationStatus = useCopyStatus(() => `Copy '${declaration.value}'`)
</script>
