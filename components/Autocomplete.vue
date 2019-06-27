<template>
  <form
    method="GET"
    action="/redirect"
    class="autocomplete"
    :class="{ open }"
    @submit="formSubmit"
    @keydown.38="focusPrevious"
    @keydown.40="focusNext">
    <input
      ref="input"
      :value="searchInput"
      placeholder="Start typing to search…"
      name="q"
      autocomplete="off"
      @input="$emit('update:searchInput', $event.target.value)"
      @focus="elementFocus"
      @blur="elementBlur" />
    <button
      ref="button"
      type="submit"
      @focus="elementFocus"
      @blur="elementBlur">Submit</button>
    <ul ref="list" class="results">
      <template v-for="result in results">
        <li :key="result.value">
          <a
            :href="'/' + result.value"
            :data-target="result.value"
            @click="linkClick"
            @focus="elementFocus"
            @blur="elementBlur">{{ result.text }}</a>
        </li>
      </template>
    </ul>
  </form>
</template>

<script>
export default {
  name: 'Autocomplete',
  props: {
    entries: {
      type: Array,
      default: () => []
    },
    searchInput: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      focused: false,
      timeout: null
    }
  },
  computed: {
    results () {
      // TODO(sandhose): filtering, highlighting
      return this.entries.map(({ itemText, prefixed }) => ({ text: itemText, value: prefixed }))
    },
    open () {
      return this.focused && this.results.length > 0
    }
  },
  methods: {
    focusNext (event) {
      // The input is focused, focus the first element of the list
      if (document.activeElement === this.$refs.input || document.activeElement === this.$refs.button) {
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
      if (li.previousElementSibling && li.previousElementSibling.tagName === 'LI') {
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
      this.focused = true
      if (this.timeout !== null) {
        clearTimeout(this.timeout)
      }
    },
    elementBlur () {
      if (this.timeout !== null) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.focused = false
      }, 100)
    },

    formSubmit (e) {
      if (guardEvent(e)) {
        const target = this.searchInput || ''
        const { location } = this.$router.resolve('/' + target)
        this.$router.push(location)
        // TODO(sandhose): find another way to close the modal
        document.activeElement.blur()
        e.preventDefault()
      }
    },

    linkClick (e) {
      // Taken from vue-router. We can't use <router-link> elements because
      // they don't forward focus/blur events.
      if (guardEvent(e)) {
        // For some reason the `href` prop isn't relative,
        // so we can't use it as is.
        const { location } = this.$router.resolve('/' + e.target.dataset.target)
        this.$router.push(location)
        // TODO(sandhose): find another way to close the modal
        document.activeElement.blur()
        e.preventDefault()
      }
    }
  }
}

function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
    return false
  }
  // don't redirect when preventDefault called
  if (e.defaultPrevented) {
    return false
  }
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) {
    return false
  }
  return true
}
</script>
