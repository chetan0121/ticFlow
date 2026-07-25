import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BoardGrid from '../../features/game/components/Grid'
import GameResultPopup from '../../features/game/components/ResultPopup'
import PlayerTimer from '../../features/game/components/PlayerTimer'
import useBoard from '../../features/game/hooks/useBoard'
import { useMenuContext } from '../../features/menu/hooks/useMenuContext'
import { GAME_MODES, GAME_SUB_MODES } from '../../features/menu/constants'
import AppRoutes from '../../router/AppRoutes'
import type { PlayerMark } from '../../features/game/types'

const PLAYER_STYLES: Record<PlayerMark, string> = {
  O: 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100',
  X: 'border-rose-300/40 bg-rose-400/10 text-rose-100',
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
    active || won ? PLAYER_STYLES[mark] : 'border-white/10 bg-white/5 text-white/50'

  return (
    <div
      className={`relative flex min-w-23 items-center justify-center overflow-hidden rounded-md border px-4 py-2 transition-colors ${stateClass}`}
    >
      <span
        className={`absolute inset-x-4 bottom-0 h-1 rounded-t-full transition-opacity ${
          active || won ? 'opacity-100' : 'opacity-0'
        } ${mark === 'O' ? 'bg-cyan-200' : 'bg-rose-200'}`}
      />
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
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 py-4 sm:gap-6 sm:py-6">
      <div className="flex w-full max-w-136 flex-col gap-4 px-1">
        <div className="flex flex-col gap-2 text-center">
          <p className="font-['Montserrat'] text-xs font-semibold tracking-[0.16em] text-amber-200/80 uppercase">
            {coreModeLabel}
          </p>
          <h1 className="font-['Oswald'] text-3xl leading-none font-semibold text-white sm:text-4xl">
            {subModeLabel}
          </h1>
        </div>

        <div className="flex items-stretch justify-center gap-2 sm:gap-3">
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

      <BoardGrid board={board} isLast={isLastMove} onCellClick={onCellClick} />
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
