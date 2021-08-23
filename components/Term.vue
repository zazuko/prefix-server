<template>
  <div class="term">
    <div v-if="language" class="language">
      {{ language }}
    </div>

    <div class="value">
      <div v-if="isExternalIRI">
        <a
          :href="value"
          target="_blank">
          {{ value }}
        </a>
      </div>
      <router-link
        v-else-if="term.objectIRI && value.endsWith(':')"
        :to="{ path: `/prefix/${value}` }">
        {{ value }}
      </router-link>
      <router-link
        v-else-if="term.objectIRI"
        :to="{ path: `/${value}` }">
        {{ value }}
      </router-link>
      <div v-else-if="isBlankNode">
        <em>blank node</em>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else v-html="xss(value)" />
    </div>
  </div>
</template>

<script>
import xss from 'xss'
export default {
  name: 'Term',
  props: {
    term: {
      type: Object,
      required: true
    }
  },
  computed: {
    isBlankNode () {
      return this.term.object.value.startsWith('b') && this.term.object.value.split('_').length === 2
    },
    isExternalIRI () {
      return this.term.object === this.term.objectIRI
    },
    language () {
      const object = this.term.object
      if (typeof object === 'object' && typeof object.language === 'string') {
        if (!object.language) {
          object.language = '""'
        }
        return `lang:${object.language}`
      }
      return false
    },
    value () {
      const object = this.term.object
      if (typeof object === 'object') {
        return object.value
      }
      return object
    }
  },
  methods: {
    xss
  }
}
</script>
