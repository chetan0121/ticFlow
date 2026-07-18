import AppRouter from './router/AppRouter'
import { GameMenuProvider } from './features/menu/context/MenuProvider'

function App() {
  return (
    <GameMenuProvider>
      <AppRouter />
    </GameMenuProvider>
  )
}

export default App
