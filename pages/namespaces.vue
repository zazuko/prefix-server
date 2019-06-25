<template>
  <div class="main-container">
    <div class="default-content">
      <div class="layout-width">
        <section class="md-content">
          <div class="content default">
            <h2>Available Namespaces</h2>
            <ul>
              <li v-for="namespace in summary" :key="namespace.prefix">
                <code>{{ namespace.prefix }}:</code>
                {{ namespace.terms }} terms
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const summary = await $axios.$get(`/api/v1/summary`)
    return {
      summary
    }
  }
}
</script>
