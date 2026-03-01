import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="flex min-h-[calc(100vh-3.5rem)] items-start justify-center px-4 py-12">
        <Outlet />
      </main>
    </div>
  )
}
