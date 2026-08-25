<template>
  <footer>
    <div class="footer-container">
      <NuxtLink to="/about" class="link">
        About
      </NuxtLink>
      <NuxtLink to="/prefixes" class="link">
        Vocabularies
      </NuxtLink>
      <NuxtLink to="/api" class="link">
        API
      </NuxtLink>
      <div class="copyright">
        <template v-if="version.name">
          <span class="part">
            Version&nbsp;<a :href="version.url" class="version">{{ version.name }}</a>
          </span>
          <span class="separator">•</span>
        </template>
        <span class="part">
          Copyright
          <a href="https://zazuko.com">Zazuko</a>
          GmbH © 2026
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { version } = useRuntimeConfig().public
</script>
