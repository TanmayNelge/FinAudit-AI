import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar.jsx'
import { Topbar } from '@/components/dashboard/topbar.jsx'
import { PollProvider } from '@/components/ui/poll-provider.jsx'

export function DashboardLayout({ user, onLogout, searchTerm, onSearchChange }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <PollProvider>
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

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
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile navigation drawer */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-black/60 lg:hidden" />
          <DialogPrimitive.Popup
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 z-50 h-full w-64 max-w-[80vw] outline-none lg:hidden"
          >
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
    </PollProvider>
  )
}