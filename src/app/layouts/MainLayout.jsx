import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import { useUIStore } from '@/store'

export default function MainLayout() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  return (
    <div className="flex h-screen overflow-hidden bg-background print:h-auto print:block print:overflow-visible">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 print:block">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-muted/30 print:overflow-visible print:p-0 print:block">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
