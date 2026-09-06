import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/sidebar.jsx'
import { Topbar } from '@/components/dashboard/topbar.jsx'

export function DashboardLayout({ user, onLogout, searchTerm, onSearchChange }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          onLogout={onLogout}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
