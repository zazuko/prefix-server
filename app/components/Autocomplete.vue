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
      @input="onInput"
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

<script setup lang="ts">
import type { TermEntry } from '#shared/types/api'

const props = withDefaults(defineProps<{
  entries?: TermEntry[]
  searchInput?: string
}>(), {
  entries: () => [],
  searchInput: ''
})
const emit = defineEmits<{
  'update:searchInput': [value: string]
}>()

const router = useRouter()
const input = useTemplateRef<HTMLInputElement>('input')
const button = useTemplateRef<HTMLButtonElement>('button')
const list = useTemplateRef<HTMLUListElement>('list')

const focused = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null

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
  if (!input.value) {
    return
  }
  input.value.selectionStart = props.searchInput.length
  input.value.selectionEnd = props.searchInput.length
  if (results.value.length) {
    input.value.focus()
    focused.value = true
  }
})

function onInput (event: Event) {
  emit('update:searchInput', (event.target as HTMLInputElement).value)
}

function onKeydown (event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.keyCode === 40) {
    focusNext(event)
  }
  else if (event.key === 'ArrowUp' || event.keyCode === 38) {
    focusPrevious(event)
  }
}

function focusElement (element: Element | null | undefined) {
  if (element instanceof HTMLElement) {
    element.focus()
  }
}

function focusNext (event: KeyboardEvent) {
  const active = document.activeElement

  // The input is focused, focus the first element of the list
  if (active === input.value || active === button.value) {
    const first = list.value?.firstElementChild
    if (first) {
      event.preventDefault()
      focusElement(first.firstElementChild)
    }
    return
  }

  const next = active?.parentElement?.nextElementSibling
  if (next) { // Check if we are not at the bottom of the list
    event.preventDefault()
    focusElement(next.firstElementChild)
  }
}

function focusPrevious (event: KeyboardEvent) {
  const active = document.activeElement

  // The input is focused, do nothing
  if (active === input.value) {
    return
  }

  const previous = active?.parentElement?.previousElementSibling
  if (previous && previous.tagName === 'LI') {
    focusElement(previous.firstElementChild)
  }
  else { // We are at the top of the list
    input.value?.focus()
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

function guardEvent (e: Event): boolean {
  const { metaKey, altKey, ctrlKey, shiftKey, button: mouseButton } = e as Partial<MouseEvent>
  // don't redirect with control keys
  if (metaKey || altKey || ctrlKey || shiftKey) {
    return false
  }
  // don't redirect when preventDefault called
  if (e.defaultPrevented) {
    return false
  }
  // don't redirect on right click
  if (mouseButton !== undefined && mouseButton !== 0) {
    return false
  }
  return true
}

function navigate (target: string, e: Event) {
  router.push(`/${target}`)
  // TODO(sandhose): find another way to close the modal
  focusElement(null)
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  e.preventDefault()
}

function formSubmit (e: Event) {
  if (guardEvent(e)) {
    navigate(props.searchInput || '', e)
  }
}

function linkClick (e: MouseEvent) {
  // Taken from vue-router. We can't use <NuxtLink> elements because
  // they don't forward focus/blur events.
  if (guardEvent(e)) {
    navigate((e.currentTarget as HTMLAnchorElement).dataset.target || '', e)
  }
}
</script>
