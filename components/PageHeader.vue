<template>
  <nav class="topbar-container reversed">
    <div class="layout-width">
      <div class="topbar">
        <div class="topbar-logo">
          <router-link to="/" class="logo router-link-active">
            <img src="~/static/zazuko-logo.svg">
            / prefix server
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'PageHader'
}
</script>
