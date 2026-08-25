<template>
  <form
    method="GET"
    action="/search"
    class="autocomplete"
    :class="{ open }"
    @submit="formSubmit"
    @keydown="onKeydown">
    <input
      ref="input"
      :value="searchInput"
      placeholder="Start typing to search…"
      name="q"
      autocomplete="off"
      autofocus
      @input="emit('update:searchInput', $event.target.value)"
      @focus="elementFocus"
      @blur="elementBlur" />
    <button
      ref="button"
      type="submit"
      @focus="elementFocus"
      @blur="elementBlur">
      Submit
    </button>
    <ul ref="list" class="results">
      <li v-for="result in results" :key="result.value">
        <a
          :href="result.href"
          :data-target="result.target"
          @click="linkClick"
          @focus="elementFocus"
          @blur="elementBlur">
          {{ result.text }}
        </a>
      </li>
    </ul>
  </form>
</template>

<script setup>
const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  searchInput: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:searchInput'])

const router = useRouter()
const input = useTemplateRef('input')
const button = useTemplateRef('button')
const list = useTemplateRef('list')

const focused = ref(false)
let timeout = null

const results = computed(() => props.entries.map(({ itemText, prefixed }) => {
  const value = String(prefixed || '')
  // namespaces (`skos:`) have their own page
  const target = value.endsWith(':') ? `prefix/${value}` : value
  return { text: itemText, value, target, href: `/${target}` }
}))

const open = computed(() => props.entries.length > 0 || (focused.value && results.value.length > 0))

watch(() => props.searchInput, () => {
  // Autofocus does not trigger `focus` events. Let's check whenever the input changes.
  if (document.querySelector(':focus') === input.value) {
    focused.value = true
  }
})

onMounted(() => {
  input.value.selectionStart = props.searchInput.length
  input.value.selectionEnd = props.searchInput.length
  if (results.value.length) {
    input.value.focus()
    focused.value = true
  }
})

function onKeydown (event) {
  if (event.key === 'ArrowDown' || event.keyCode === 40) {
    focusNext(event)
  }
  else if (event.key === 'ArrowUp' || event.keyCode === 38) {
    focusPrevious(event)
  }
}

function focusNext (event) {
  // The input is focused, focus the first element of the list
  if (document.activeElement === input.value || document.activeElement === button.value) {
    const el = list.value.firstElementChild
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
}

function focusPrevious (event) {
  // The input is focused, do nothing
  if (document.activeElement === input.value) {
    return
  }

  const li = document.activeElement.parentElement
  if (li.previousElementSibling && li.previousElementSibling.tagName === 'LI') {
    li.previousElementSibling.firstElementChild.focus()
  }
  else { // We are at the top of the list
    input.value.focus()
  }
  event.preventDefault()
}

// Open/closed handling. Let's assume `blur` is always sent
// before `focus` events
function elementFocus () {
  focused.value = true
  if (timeout !== null) {
    clearTimeout(timeout)
  }
}

function elementBlur () {
  if (timeout !== null) {
    clearTimeout(timeout)
  }
  timeout = setTimeout(() => {
    focused.value = false
  }, 100)
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

function navigate (target, e) {
  router.push(`/${target}`)
  // TODO(sandhose): find another way to close the modal
  document.activeElement.blur()
  e.preventDefault()
}

function formSubmit (e) {
  if (guardEvent(e)) {
    navigate(props.searchInput || '', e)
  }
}

function linkClick (e) {
  // Taken from vue-router. We can't use <NuxtLink> elements because
  // they don't forward focus/blur events.
  if (guardEvent(e)) {
    navigate(e.target.dataset.target, e)
  }
}
</script>
