import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar.jsx'
import { Topbar } from '@/components/dashboard/topbar.jsx'

export function DashboardLayout({ user, onLogout, searchTerm, onSearchChange }) {
  const [mobileOpen, setMobileOpen] = useState(false)

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
          onOpenMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile navigation drawer */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-black/60 lg:hidden" />
          <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 h-full w-64 max-w-[80vw] outline-none lg:hidden">
            <DialogPrimitive.Close
              render={
                <button
                  type="button"
                  aria-label="Close navigation"
                  className="absolute right-0 top-0 z-10 m-2 flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                />
              }
            >
              <X className="size-4" aria-hidden="true" />
            </DialogPrimitive.Close>
            <Sidebar user={user} onNavigate={() => setMobileOpen(false)} />
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}