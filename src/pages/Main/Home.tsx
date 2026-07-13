import { useNavigate } from 'react-router-dom'
import HomeHero from '../../components/ui/HomeHero'
import { useWindowEnterKey } from '../../hooks/useWindowEnterKey'
import AppRoutes from '../../router/AppRoutes'

function Home() {
  const nav = useNavigate()
  const toGamePage = () => {
    void nav(AppRoutes.gameMenu.path)
  }

  useWindowEnterKey(toGamePage)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <HomeHero />
    </div>
  )
}

export default Home
