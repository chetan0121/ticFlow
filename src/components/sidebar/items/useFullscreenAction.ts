import { Fullscreen, Minimize } from 'lucide-react'
import { useFullscreen } from '../../../hooks/useFullscreen'

function useFullscreenAction() {
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  return {
    key: 'fullscreen',
    label: isFullscreen ? 'Minimize' : 'Fullscreen',
    Icon: isFullscreen ? Minimize : Fullscreen,
    onClick: () => {
      void toggleFullscreen()
    },
  }
}

export default useFullscreenAction
