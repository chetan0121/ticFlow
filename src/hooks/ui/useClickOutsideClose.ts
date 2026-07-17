import { useCallback, useEffect, useRef, useState } from 'react'

interface UseClickOutsideCloseReturn {
  ref: React.RefObject<HTMLDivElement | null>
  isOpen: boolean
  toggle: () => void
  close: () => void
  open: () => void
}

/**
 * Custom hook to handle click-outside and Escape key to close a panel/modal
 * @returns Object containing ref, isOpen state, and control functions
 */
export function useClickOutsideClose(): UseClickOutsideCloseReturn {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  // Handle Escape and Outside clicks to close panel
  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close()
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }

    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside)
      document.addEventListener('keydown', handleKey)
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, close])

  return {
    ref,
    isOpen,
    toggle,
    close,
    open,
  }
}
