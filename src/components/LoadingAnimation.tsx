import { useState, useEffect } from 'react'

export type LoadingMessage = {
  txt: string
  keepTime: number
}

interface LoadingAnimProps {
  messages?: LoadingMessage[]
  onLastMessage?: () => void
}

const DEFAULT_LOADING_MESSAGES: LoadingMessage[] = [{ txt: 'Loading...', keepTime: 0 }]

export default function LoadingAnimation({
  messages = DEFAULT_LOADING_MESSAGES,
  onLastMessage,
}: LoadingAnimProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!messages || messages.length === 0) return

    if (currentIndex >= messages.length - 1) {
      onLastMessage?.()
      return
    }

    const currentMessage = messages[currentIndex]
    if (currentMessage.keepTime <= 0) return

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
    }, currentMessage.keepTime * 1000)

    return () => clearTimeout(timer)
  }, [currentIndex, messages, onLastMessage])

  const message = messages[currentIndex]?.txt ?? 'Loading...'

  return (
    <div className="flex w-[90vw] flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="h-24 w-24 animate-spin rounded-full border-4 border-transparent border-t-[hsl(38,95%,62%)] border-b-[hsl(28,90%,45%)]"></div>

        <div className="absolute h-16 w-16 animate-[spin_1.5s_linear_infinite_reverse] rounded-full border-4 border-transparent border-r-[hsl(48,90%,65%)] border-l-[hsl(18,85%,55%)] opacity-70"></div>

        <div className="absolute h-4 w-4 animate-pulse rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
      </div>

      <span className="mt-6 animate-pulse text-center font-['Montserrat'] text-sm font-medium tracking-wide text-[hsl(38,95%,62%)]">
        {message}
      </span>
    </div>
  )
}
