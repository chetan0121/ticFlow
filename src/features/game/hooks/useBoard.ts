import { useState, useEffect } from 'react'
import { cloneGameState, createDefaultGameState } from '../constants'
import { useMenuContext } from '../../menu/hooks/useMenuContext'
import type { GameCellClickHandler, GameConfig, GameState } from '../types'
import { flocalHandler } from '../utils/flocal'
import { Engine } from '../engine/GameEngine'

const MINUTE_IN_MS = 60_000

function createInitialGameState(timeLimit: GameConfig['timeLimit']): GameState {
  const initialState = createDefaultGameState()
  const initialTime = timeLimit === null ? null : timeLimit * MINUTE_IN_MS

  initialState.baseGame.currentTurn = 'O'
  initialState.status = 'playing'
  initialState.playerO.remainingTime = initialTime
  initialState.playerX.remainingTime = initialTime

  return initialState
}

function useBoard() {
  const { state } = useMenuContext()
  const config: GameConfig = {
    subMode: state.subMode,
    timeLimit: state.timeControl,
    moveLimit: state.moveLimit,
  }

  const [game, setGame] = useState(() => createInitialGameState(config.timeLimit))
  const engine = new Engine(config)

  useEffect(() => {
    if (config.timeLimit === null) return

    const timer = setInterval(() => {
      setGame(prev => {
        if (prev.status !== 'playing') return prev

        const g = cloneGameState(prev)
        const currPlayer = g.baseGame.currentTurn === 'O' ? g.playerO : g.playerX

        if (currPlayer.remainingTime === null) return prev

        currPlayer.remainingTime = Math.max(0, currPlayer.remainingTime - 100)

        if (currPlayer.remainingTime <= 0) {
          g.winner = g.baseGame.currentTurn === 'O' ? 'X' : 'O'
          g.status = 'finished'
        }

        return g
      })
    }, 100)

    return () => clearInterval(timer)
  }, [config.timeLimit, game.status])

  let onCellClick: GameCellClickHandler = () => undefined

  switch (state.subMode) {
    case 'flocal':
      onCellClick = flocalHandler(setGame, engine)
      break
  }

  function isLast(rowIndex: number, cellIndex: number) {
    if (game.status !== 'playing') return false

    const n = game.baseGame.board.length

    const lastMove1 = game.playerO.moves[0]
    if (
      game.playerO.moves.length === n &&
      lastMove1[0] === rowIndex &&
      lastMove1[1] === cellIndex
    )
      return true

    const lastMove2 = game.playerX.moves[0]
    if (
      game.playerX.moves.length === n &&
      lastMove2[0] === rowIndex &&
      lastMove2[1] === cellIndex
    )
      return true

    return false
  }

  function replay() {
    setGame(createInitialGameState(config.timeLimit))
  }

  return {
    board: game.baseGame.board,
    currentTurn: game.baseGame.currentTurn,
    isLast,
    onCellClick,
    playerO: game.playerO,
    playerX: game.playerX,
    replay,
    status: game.status,
    timeLimit: config.timeLimit,
    winner: game.winner,
  }
}

export default useBoard
