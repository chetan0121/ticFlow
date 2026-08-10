import { useEffect } from 'react'

type useEnterKeyOptions = {
  enabled?: boolean
  preventDefault?: boolean
  ignoreInputLike?: boolean
}

export function useEnterKey(handler: () => void, options: useEnterKeyOptions = {}) {
  const { enabled = true, preventDefault = true, ignoreInputLike = true } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.defaultPrevented) return

      if (ignoreInputLike) {
        const target = event.target
        const isInputLike =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          (target instanceof HTMLElement && target.isContentEditable)

        if (isInputLike) return
      }

      if (preventDefault) event.preventDefault()
      handler()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handler, ignoreInputLike, preventDefault])
}
