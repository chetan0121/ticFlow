import { Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppRoutes from '../../router/AppRoutes'

function HomeHero() {
  // Text of the Component
  const HEADING = 'TicFlow'
  const DESCRIPTION =
    'The classic game reimagined. Experience strategic depth, and visually stunning gameplay.'
  const START_BTN = 'START'

  // To Handle Navigation
  const navigate = useNavigate()
  const toGamePage = () => {
    void navigate(AppRoutes.gameMenu.path)
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10">
      {/* Head */}
      <div className="flex max-w-100 flex-col items-center justify-center gap-1">
        {/* Title */}
        <h1 className="font-['Oswald'] text-5xl font-semibold tracking-wider md:text-6xl">
          {HEADING}
        </h1>

        {/* Description */}
        <p className="text-md mx-auto mt-10 text-center font-['Montserrat'] tracking-wide text-white/70 md:text-lg">
          {DESCRIPTION}
        </p>
      </div>

      {/* Start Button */}
      <div>
        <button
          onClick={toGamePage}
          className="group relative flex flex-row items-center gap-2 overflow-hidden rounded-xl border-2 border-[hsl(38,95%,62%)] bg-[hsl(38,95%,54%)] px-8 py-3 tracking-wide text-black shadow-[0_0_14px_hsl(38,95%,54%)] transition-transform duration-300 ease-out hover:scale-105 hover:border-[hsl(45,100%,70%)] hover:bg-[hsl(38,95%,58%)] hover:shadow-[0_0_18px_hsl(38,95%,54%)] active:scale-95 active:bg-[hsl(38,95%,46%)]"
        >
          <span className="font-['Patrick_Hand'] text-lg select-none md:text-xl">
            {START_BTN}
          </span>
          <Play
            size={16}
            fill="currentColor"
            className="mt-0.5 transition-transform duration-300 ease-in-out group-hover:rotate-360"
          />
          <span className="pointer-events-none absolute inset-0 before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.5),transparent)] before:transition-transform before:duration-700 group-hover:before:translate-x-full" />
        </button>
      </div>
    </div>
  )
}

export default HomeHero
