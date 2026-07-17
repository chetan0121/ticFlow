import { useState, useEffect, useCallback } from 'react'

/*
 * Hook to manage browser fullscreen state and toggling functionality.
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen?.()
      } else if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err)
    }
  }, [])

  return { isFullscreen, toggleFullscreen }
}
