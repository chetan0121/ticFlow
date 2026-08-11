import AppRouter from './router/AppRouter'
import { AuthProvider } from './features/auth/context/AuthProvider'
import { GameMenuProvider } from './features/menu/context/MenuProvider'

function App() {
  return (
    <AuthProvider>
      <GameMenuProvider>
        <AppRouter />
      </GameMenuProvider>
    </AuthProvider>
  )
}

export default App
