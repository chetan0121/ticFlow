import { useNavigate } from 'react-router-dom'
import NextButton from '../../components/buttons/NextButton'
import MenuHeader from '../../features/menu/components/MenuHeader'
import MenuSetupPanel from '../../features/menu/components/MenuSetup'
import { useEnterKey } from '../../hooks/useEnterKey'
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

  useEnterKey(startGame)

  return (
    <div className="flex h-full w-full max-w-6xl flex-col gap-10 py-10">
      <MenuHeader title={TEXT.title} />

      <MenuSetupPanel />

      <div className="self-center md:self-baseline">
        <NextButton text={TEXT.buttons.startGame} onClick={startGame} />
      </div>
    </div>
  )
}

export default GameMenu
