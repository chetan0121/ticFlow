import { useNavigate } from 'react-router-dom'
import NextButton from '../../components/ui/Buttons/NextButton'
import ConfigHeader from '../../components/game/configs/ConfigHeader'
import GameSetupPanel from '../../components/game/configs/GameSetupPanel'
import { useWindowEnterKey } from '../../hooks/useWindowEnterKey'
import AppRoutes from '../../router/AppRoutes'

const TEXT = {
  title: 'Game Setup',
  buttons: {
    startGame: 'Start Game',
  },
}

function GameMenu() {
  const nav = useNavigate()
  const startGame = () => {
    void nav(AppRoutes.gameBoard.path)
  }

  useWindowEnterKey(startGame)

  return (
    <div className="flex h-full w-full max-w-6xl flex-col gap-10 py-10">
      <ConfigHeader title={TEXT.title} />

      <GameSetupPanel maxWidth="100%" />

      <div className="self-center md:self-baseline">
        <NextButton text={TEXT.buttons.startGame} onClick={startGame} />
      </div>
    </div>
  )
}

export default GameMenu
