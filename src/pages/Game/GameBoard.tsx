import BoardGrid from '../../features/game/components/Grid'
import useBoard from '../../features/game/hooks/useBoard'
import { useMenuContext } from '../../features/menu/hooks/useMenuContext'
import { GAME_MODES, GAME_SUB_MODES } from '../../features/menu/constants'

function GameBoard() {
  const { board, onCellClick } = useBoard()
  const {
    state: { coreMode, subMode },
  } = useMenuContext()

  const coreModeLabel =
    GAME_MODES().modes.find(mode => mode.value === coreMode)?.label ?? coreMode
  const subModeLabel =
    GAME_SUB_MODES(coreMode).modes.find(mode => mode.value === subMode)?.label ?? subMode

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 py-6 sm:gap-8 sm:py-8">
      <div className="flex w-full max-w-3xl flex-col items-center px-2 text-center">
        <p className="flex max-w-full flex-wrap items-baseline justify-center gap-x-2 gap-y-1 font-['Montserrat'] text-[clamp(1.45rem,6vw,2.5rem)] leading-tight font-bold text-white">
          <span className="min-w-0 text-2xl wrap-break-word text-[hsl(38,95%,62%)] md:text-3xl">
            {coreModeLabel}
          </span>
          <span className="text-white/35">:</span>
          <span className="min-w-0 text-2xl wrap-break-word text-white/90 md:text-3xl">
            {subModeLabel}
          </span>
        </p>
      </div>

      <BoardGrid board={board} onCellClick={onCellClick} />
    </div>
  )
}

export default GameBoard
