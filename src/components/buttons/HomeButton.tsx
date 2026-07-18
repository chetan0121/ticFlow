import { useNavigate } from 'react-router-dom'
import AppRoutes from '../../router/AppRoutes'

function GoHomeBtn() {
  const btnTxt = 'Go to Home'

  const navigate = useNavigate()
  const handleGoHome = () => {
    void navigate(AppRoutes.home.path)
  }

  return (
    <div>
      <button
        onClick={handleGoHome}
        className="transition-color rounded-xl border-[3px] border-[hsl(38,95%,62%)] bg-transparent px-5 py-2 font-['Patrick_Hand'] text-lg font-bold text-[hsl(38,95%,62%)] duration-300 ease-in-out hover:border-[hsl(45,100%,70%)] hover:bg-[hsl(38,95%,54%)] hover:text-black active:scale-95 active:bg-[hsl(38,95%,46%)] md:text-xl"
      >
        {btnTxt}
      </button>
    </div>
  )
}

export default GoHomeBtn
