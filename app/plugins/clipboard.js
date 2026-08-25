/*
 * `v-clipboard` directive:
 *
 *   <a v-clipboard="() => text" v-clipboard:success="onSuccess" v-clipboard:error="onError">
 *
 * Clicking the element copies the value (a string or a function returning one)
 * to the clipboard, then calls the success or error callback.
 */
const bindings = new WeakMap()

function stateOf (el) {
  if (!bindings.has(el)) {
    bindings.set(el, {})
  }
  return bindings.get(el)
}

async function writeText (text) {
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

async function copy (el) {
  const state = stateOf(el)
  const text = typeof state.value === 'function' ? state.value() : state.value
  try {
    await writeText(String(text ?? ''))
    if (state.success) {
      state.success(text)
    }
  }
  catch (error) {
    if (state.error) {
      state.error(error)
    }
  }
}

function update (el, binding) {
  const state = stateOf(el)
  if (binding.arg === 'success' || binding.arg === 'error') {
    state[binding.arg] = binding.value
  }
  else {
    state.value = binding.value
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('clipboard', {
    getSSRProps: () => ({}),
    mounted (el, binding) {
      update(el, binding)
      if (!binding.arg) {
        const listener = () => copy(el)
        stateOf(el).listener = listener
        el.addEventListener('click', listener)
      }
    },
    updated: update,
    unmounted (el, binding) {
      if (!binding.arg) {
        const state = bindings.get(el)
        if (state && state.listener) {
          el.removeEventListener('click', state.listener)
        }
        bindings.delete(el)
      }
    }
  })
})
