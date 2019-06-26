<template>
  <div
    class="autocomplete"
    :class="{ open }"
    @keydown.38="focusPrevious"
    @keydown.40="focusNext">
    <input
      ref="input"
      placeholder="Start typing to search…"
      @focus="elementFocus"
      @blur="elementBlur" />
    <ul ref="list" class="results">
      <template v-for="result in results">
        <li :key="result">
          <a
            :href="'/' + result"
            :data-target="result"
            @click="linkClick"
            @focus="elementFocus"
            @blur="elementBlur">{{ result }}</a>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Autocomplete',
  data () {
    return {
      open: false,
      timeout: null,
      results: ['foaf:Document', 'foo:Bar', 'baz:Foobar']
    }
  },
  methods: {
    focusNext (event) {
      // The input is focused, focus the first element of the list
      if (document.activeElement === this.$refs.input) {
        const el = this.$refs.list.firstElementChild
        if (el) {
          event.preventDefault()
          el.firstElementChild.focus()
        }
        return
      }

      const li = document.activeElement.parentElement
      if (li.nextElementSibling) { // Check if we are not at the bottom of the list
        event.preventDefault()
        li.nextElementSibling.firstElementChild.focus()
      }
    },
    focusPrevious (event) {
      // The input is focused, do nothing
      if (document.activeElement === this.$refs.input) {
        return
      }

      const li = document.activeElement.parentElement
      if (li.previousElementSibling) {
        li.previousElementSibling.firstElementChild.focus()
      }
      else { // We are at the top of the list
        this.$refs.input.focus()
      }
      event.preventDefault()
    },

    // Open/closed handling. Let's assume `blur` is always sent
    // before `focus` events
    elementFocus () {
      this.open = true
      if (this.timeout !== null) {
        clearTimeout(this.timeout)
      }
    },
    elementBlur () {
      if (this.timeout !== null) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.open = false
      }, 100)
    },

    linkClick (e) {
      // Taken from vue-router. We can't use <router-link> elements because
      // they don't forward focus/blur events.

      // don't redirect with control keys
      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
        return
      }
      // don't redirect when preventDefault called
      if (e.defaultPrevented) {
        return
      }
      // don't redirect on right click
      if (e.button !== undefined && e.button !== 0) {
        return
      }

      // For some reason the `href` prop isn't relative,
      // so we can't use it as is.
      const { location } = this.$router.resolve(e.target.dataset.target)
      this.$router.push(location)
      // TODO(sandhose): find another way to close the modal
      document.activeElement.blur()
      e.preventDefault()
    }
  }
}
</script>
