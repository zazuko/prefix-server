/*
 * `v-clipboard` directive:
 *
 *   <a v-clipboard="() => text" v-clipboard:success="onSuccess" v-clipboard:error="onError">
 *
 * Clicking the element copies the value (a string or a function returning one)
 * to the clipboard, then calls the success or error callback.
 */
import type { Directive, DirectiveBinding } from 'vue'

type ClipboardValue = string | (() => string)
type ClipboardCallback = (payload: unknown) => void
type ClipboardBindingValue = ClipboardValue | ClipboardCallback

interface ClipboardState {
  value?: ClipboardValue
  success?: ClipboardCallback
  error?: ClipboardCallback
  listener?: () => void
}

const bindings = new WeakMap<HTMLElement, ClipboardState>()

function stateOf (el: HTMLElement): ClipboardState {
  let state = bindings.get(el)
  if (!state) {
    state = {}
    bindings.set(el, state)
  }
  return state
}

async function writeText (text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  // fallback for insecure contexts
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    if (!document.execCommand('copy')) {
      throw new Error('copy command failed')
    }
  }
  finally {
    document.body.removeChild(textarea)
  }
}

async function copy (el: HTMLElement): Promise<void> {
  const state = stateOf(el)
  const text = typeof state.value === 'function' ? state.value() : state.value
  try {
    await writeText(String(text ?? ''))
    state.success?.(text)
  }
  catch (error) {
    state.error?.(error)
  }
}

function update (el: HTMLElement, binding: DirectiveBinding<ClipboardBindingValue>) {
  const state = stateOf(el)
  const arg = binding.arg as string | undefined
  if (arg === 'success' || arg === 'error') {
    state[arg] = binding.value as ClipboardCallback
  }
  else {
    state.value = binding.value as ClipboardValue
  }
}

const clipboard: Directive<HTMLElement, ClipboardBindingValue> = {
  getSSRProps: () => ({}),
  mounted (el, binding) {
    update(el, binding)
    if (!binding.arg) {
      const listener = () => {
        copy(el)
      }
      stateOf(el).listener = listener
      el.addEventListener('click', listener)
    }
  },
  updated: update,
  unmounted (el, binding) {
    if (!binding.arg) {
      const state = bindings.get(el)
      if (state?.listener) {
        el.removeEventListener('click', state.listener)
      }
      bindings.delete(el)
    }
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('clipboard', clipboard)
})
