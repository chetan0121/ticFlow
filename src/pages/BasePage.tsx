import { type ReactNode } from 'react'
import BackButton from '../components/ui/Buttons/BackButton'
import SidebarButton from '../components/ui/Sidebar/SidebarButton'

interface BasePageProps {
  children: ReactNode
}

function BasePage({ children }: BasePageProps) {
  return (
    <div className="flex h-screen min-h-screen w-screen flex-col items-center justify-start overflow-x-hidden bg-linear-135 from-[hsl(18,36%,9%)] via-[hsl(34,34%,16%)] to-[hsl(48,28%,13%)]">
      <div className="flex w-full items-center gap-3 px-6 pt-4 pb-3">
        <SidebarButton />
        <BackButton />
      </div>
      <main className="h-full w-full px-10">{children}</main>
    </div>
  )
}

export default BasePage
