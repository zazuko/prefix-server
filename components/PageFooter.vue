<template>
  <footer>
    <div class="footer-container">
      <router-link to="/about" class="link">
        About
      </router-link>
      <router-link to="/prefixes" class="link">
        Vocabularies
      </router-link>
      <router-link to="/api" class="link">
        API
      </router-link>
      <div class="copyright">
        <template v-if="version">
          <span class="part">
            Version&nbsp;<a :href="version.url" class="version">{{ version.name }}</a>
          </span>
          <span class="separator">•</span>
        </template>
        <span class="part">
          Copyright
          <a href="http://zazuko.com">Zazuko</a>
          GmbH © 2019
        </span>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'PageFooter',
  data () {
    return { version: process.env.version }
  }
}
</script>
