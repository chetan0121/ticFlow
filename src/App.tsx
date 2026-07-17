import AppRouter from './router/AppRouter'
import { GameMenuProvider } from './game/menu/MenuState'

function App() {
  return (
    <GameMenuProvider>
      <AppRouter />
    </GameMenuProvider>
  )
}

export default App
