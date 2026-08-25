type CopyStatus = false | 'success' | 'error'

/**
 * Tracks the outcome of a copy-to-clipboard action and reports it for 3 seconds.
 */
export function useCopyStatus (idleMessage: string | (() => string)) {
  const status = ref<CopyStatus>(false)
  let timeout: ReturnType<typeof setTimeout> | null = null

  const message = computed(() => {
    if (status.value === 'success') {
      return 'Copied!'
    }
    if (status.value === 'error') {
      return 'Error'
    }
    return typeof idleMessage === 'function' ? idleMessage() : idleMessage
  })

  function set (value: CopyStatus) {
    status.value = value
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      status.value = false
      timeout = null
    }, 3000)
  }

  return {
    message,
    success: () => set('success'),
    error: () => set('error')
  }
}
