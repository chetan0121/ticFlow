import AppRouter from './router/AppRouter'
import { GameMenuProvider } from './state/game/menu/MenuState'

function App() {
  return (
    <GameMenuProvider>
      <AppRouter />
    </GameMenuProvider>
  )
}

export default App
