<template>
  <div>
    <div v-if="isExternalIRI">
      <a
        :href="term.objectIRI"
        target="_blank"
      >
        {{ term.object }}
      </a>
    </div>
    <router-link
      v-else-if="term.objectIRI"
      :to="{ path: `/${term.object}` }"
    >
      {{ term.object }}
    </router-link>
    <div v-else-if="language">
      <span class="language">{{ language }}</span>
      <br>
      {{ term.object.value }}
    </div>
    <div v-else>
      {{ term.object }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Term',
  props: {
    term: {
      type: Object,
      required: true
    }
  },
  computed: {
    isExternalIRI() {
      return this.term.object === this.term.objectIRI
    },
    language() {
      const object = this.term.object
      if (typeof object === 'object' && typeof object.language === 'string') {
        if (!object.language) {
          object.language = '""'
        }
        return `lang:${object.language}`
      }
      return false
    }
  }
}
</script>
