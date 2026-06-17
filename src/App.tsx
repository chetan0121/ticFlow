import AppRouter from './router/AppRouter'
import { GameMenuProvider } from './state/game/Menu/MenuState'

function App() {
  return (
    <GameMenuProvider>
      <AppRouter />
    </GameMenuProvider>
  )
}

export default App
