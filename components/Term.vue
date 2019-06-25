<template>
  <div class="term">
    <div v-if="language" class="language">
      {{ language }}
    </div>

    <div class="value">
      <div v-if="isExternalIRI">
        <a
          :href="value"
          target="_blank"
        >
          {{ value }}
        </a>
      </div>
      <router-link
        v-else-if="term.objectIRI"
        :to="{ path: `/${value}` }"
      >
        {{ value }}
      </router-link>
      <div v-else>
        {{ value }}
      </div>
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
    value() {
      const object = this.term.object
      if (typeof object === 'object') {
        return object.value
      }
      return object
    }
  }
}
</script>

<style lang="scss" scoped>
.term {
  color: rgba(0,0,0,0.60);
  letter-spacing: 0.25px;
  text-align: justify;
  line-height: 20px;

  .language {
    color: #FF441C;
  }
  a {
    color: #FF441C;
  }
}
</style>
