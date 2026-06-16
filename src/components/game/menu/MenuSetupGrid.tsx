import type { ReactNode } from 'react'

interface GameMenuGridProps {
  children: ReactNode
}

function GameMenuGrid({ children }: GameMenuGridProps) {
  return (
    <div
      className='grid w-full gap-4'
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
      }}
    >
      {children}
    </div>
  )
}

export default GameMenuGrid
