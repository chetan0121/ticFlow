import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Circle, RotateCcw, X } from 'lucide-react'
import BoardGrid from '../../features/game/components/Grid'
import GameResultPopup from '../../features/game/components/ResultPopup'
import PlayerTimer from '../../features/game/components/PlayerTimer'
import useBoard from '../../features/game/hooks/useBoard'
import { useMenuContext } from '../../features/menu/hooks/useMenuContext'
import { GAME_MODES, GAME_SUB_MODES } from '../../features/menu/constants'
import AppRoutes from '../../router/AppRoutes'
import type { PlayerMark } from '../../features/game/types'

const PLAYER_STYLES: Record<PlayerMark, string> = {
  O: 'border-cyan-300/45 bg-cyan-400/12 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.12)]',
  X: 'border-rose-300/45 bg-rose-400/12 text-rose-100 shadow-[0_0_28px_rgba(251,113,133,0.12)]',
}

function PlayerBadge({
  mark,
  active,
  won,
}: {
  mark: PlayerMark
  active: boolean
  won: boolean
}) {
  const stateClass =
    active || won ? PLAYER_STYLES[mark] : 'border-white/10 bg-black/18 text-white/48'
  const Icon = mark === 'O' ? Circle : X

  const Name = 'Player'

  return (
    <div
      className={`relative flex min-w-0 flex-1 items-center justify-between overflow-hidden rounded-lg border px-3 py-2.5 transition-all duration-300 ${stateClass}`}
    >
      <span
        className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition-opacity ${
          active || won ? 'opacity-100' : 'opacity-0'
        } ${mark === 'O' ? 'bg-cyan-200' : 'bg-rose-200'}`}
      />
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 opacity-85" strokeWidth={2.4} />
        <span className="mt-0.65 font-['Montserrat'] text-[10px] font-bold tracking-widest text-white/45 uppercase">
          {Name}
        </span>
      </span>
      <span className="font-['Oswald'] text-2xl leading-none font-semibold">{mark}</span>
    </div>
  )
}

function GameBoard() {
  const {
    board,
    currentTurn,
    isLastMove,
    onCellClick,
    players,
    replay,
    status,
    timeLimit,
    winner,
  } = useBoard()
  const [showResultPopup, setShowResultPopup] = useState(false)
  const navigate = useNavigate()
  const {
    state: { coreMode, subMode },
  } = useMenuContext()

  const coreModeLabel =
    GAME_MODES().modes.find(mode => mode.value === coreMode)?.label ?? coreMode
  const subModeLabel =
    GAME_SUB_MODES(coreMode).modes.find(mode => mode.value === subMode)?.label ?? subMode

  useEffect(() => {
    if (status === 'finished' && winner !== null) {
      // Schedule the state update to avoid cascading renders
      // by deferring it to the next tick.
      requestAnimationFrame(() => setShowResultPopup(true))
    }
  }, [status, winner])

  function handleBackToMenu() {
    void navigate(AppRoutes.gameMenu.path)
  }

  function handleReplay() {
    replay()
    setShowResultPopup(false)
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center px-0 py-3 sm:py-5">
      <div className="flex w-full max-w-[min(92vw,38rem)] flex-col gap-3 sm:gap-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-['Montserrat'] text-[10px] font-semibold tracking-[0.2em] text-amber-200/75 uppercase">
              {coreModeLabel}
            </p>
            <h1 className="mt-1 truncate font-['Oswald'] text-3xl leading-none font-semibold text-white sm:text-4xl">
              {subModeLabel}
            </h1>
          </div>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={handleReplay}
              className="group flex h-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-black/18 px-3 font-['Montserrat'] text-xs font-bold text-white/72 transition-colors hover:border-amber-200/35 hover:bg-amber-200/10 hover:text-amber-100 focus-visible:ring-2 focus-visible:ring-amber-200/45 focus-visible:outline-none"
              aria-label="Restart same game"
            >
              <RotateCcw
                className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45"
                strokeWidth={2.4}
              />
              <span className="hidden min-[430px]:inline">Restart</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3">
          {timeLimit !== null ? (
            <>
              <PlayerTimer
                mark="O"
                remainingTime={players.O.remainingTime}
                active={currentTurn === 'O' && !winner}
                winner={winner}
              />
              <PlayerTimer
                mark="X"
                remainingTime={players.X.remainingTime}
                active={currentTurn === 'X' && !winner}
                winner={winner}
              />
            </>
          ) : (
            <>
              <PlayerBadge
                mark="O"
                active={currentTurn === 'O' && !winner}
                won={winner === 'O'}
              />
              <PlayerBadge
                mark="X"
                active={currentTurn === 'X' && !winner}
                won={winner === 'X'}
              />
            </>
          )}
        </div>
      </div>

      <div className="mt-3 w-full sm:mt-4">
        <BoardGrid board={board} isLast={isLastMove} onCellClick={onCellClick} />
      </div>
      <GameResultPopup
        actions={{
          back: handleBackToMenu,
          close: () => setShowResultPopup(false),
          replay: handleReplay,
        }}
        open={showResultPopup}
        winner={winner}
      />
    </div>
  )
}

export default GameBoard
