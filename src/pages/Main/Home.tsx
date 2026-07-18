import { useNavigate } from 'react-router-dom'
import HomeHero from '../../components/HomeHero'
import { useEnterKey } from '../../hooks/useEnterKey'
import AppRoutes from '../../router/AppRoutes'

function Home() {
  const nav = useNavigate()
  const toGamePage = () => {
    void nav(AppRoutes.gameMenu.path)
  }

  useEnterKey(toGamePage)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <HomeHero />
    </div>
  )
}

export default Home
