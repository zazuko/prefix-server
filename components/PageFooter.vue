<template>
  <footer>
    <div class="footer-container">
      <router-link to="/namespaces" class="link">
        Vocabularies
      </router-link>
      <router-link to="/api" class="link">
        API
      </router-link>
      <div class="copyright">
        Copyright <a href="http://zazuko.com">Zazuko</a> GmbH © 2019
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'PageFooter'
}
</script>
