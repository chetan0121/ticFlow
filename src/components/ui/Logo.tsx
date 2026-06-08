import { Link } from 'react-router-dom'
import AppRoutes from '../../router/AppRoutes'

interface LogoProps {
  text?: string
  className?: string
}

function Logo({ className = '' }: LogoProps) {
  return (
    <Link
      to={AppRoutes.home.path}
      className={`flex h-10 min-w-16 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-white/5 px-3 font-['Oswald'] text-sm font-semibold tracking-[0.3em] text-white/85 transition-colors hover:border-white/35 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none ${className}`}
      aria-label="Go to home"
    >
      <img src="/logo/tic_flow_logo.png" alt="Logo" className="h-full object-contain py-1" />
    </Link>
  )
}

export default Logo
