import { useLocation, useNavigate } from 'react-router-dom'
import { Search, LogOut, UserRound, Settings, ChevronDown } from 'lucide-react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { NotificationBell } from './notification-bell.jsx'

const pageMeta = {
  '/dashboard': { title: 'Compliance Overview', description: 'Monitor document reviews and regulatory status' },
  '/documents': { title: 'Documents', description: 'Review uploaded documents and compliance scores' },
  '/upload': { title: 'Upload Queue', description: 'Upload PDFs for compliance analysis' },
  '/flagged-items': { title: 'Flagged Items', description: 'Compliance risks detected across documents' },
  '/audit-history': { title: 'Audit Trail', description: 'Chronological ledger of compliance analyses' },
  '/team': { title: 'Team', description: 'Manage your compliance team' },
  '/settings': { title: 'Settings', description: 'Configure workspace preferences' },
  '/profile': { title: 'Profile', description: 'Manage your account information' },
  '/support': { title: 'Support', description: 'Get help with FinAudit AI' },
}

const getMeta = (pathname) => {
  if (Object.hasOwn(pageMeta, pathname)) return pageMeta[pathname]
  if (pathname.startsWith('/documents/')) return { title: 'Document Analysis', description: 'Detailed compliance review' }
  return { title: 'FinAudit AI', description: 'Compliance & document audit platform' }
}

const getInitials = (name) => {
  if (!name) return 'FA'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function UserMenu({ user, onLogout }) {
  const navigate = useNavigate()
  const handleNavigate = (to) => () => navigate(to)

  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger
        render={
          <button
            type="button"
            aria-label="Account menu"
            className="flex items-center gap-2 rounded-md border border-border bg-card py-1.5 pl-1.5 pr-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        }
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-semibold text-primary">
          {getInitials(user?.name)}
        </span>
        <span className="hidden max-w-32 truncate text-xs font-medium xl:inline">
          {user?.name || 'Account'}
        </span>
        <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
      </MenuPrimitive.Trigger>

      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner sideOffset={6} align="end" className="z-50">
          <MenuPrimitive.Popup className="w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 text-sm shadow-xl outline-none">
            <div className="flex min-w-0 flex-col border-b border-border px-2.5 py-2">
              <span className="truncate text-sm font-medium text-foreground">{user?.name}</span>
              <span className="truncate font-mono text-xs text-muted-foreground">{user?.email}</span>
            </div>
            <MenuPrimitive.Item
              onClick={handleNavigate('/profile')}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors data-[highlighted]:bg-secondary data-[highlighted]:text-foreground"
            >
              <UserRound className="size-4" aria-hidden="true" />
              Profile
            </MenuPrimitive.Item>
            <MenuPrimitive.Item
              onClick={handleNavigate('/settings')}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors data-[highlighted]:bg-secondary data-[highlighted]:text-foreground"
            >
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </MenuPrimitive.Item>
            <MenuPrimitive.Separator className="my-1 h-px bg-border" />
            <MenuPrimitive.Item
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-destructive outline-none transition-colors data-[highlighted]:bg-destructive/10"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </MenuPrimitive.Item>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

export function Topbar({ user, onLogout, searchTerm = '', onSearchChange }) {
  const { pathname } = useLocation()
  const meta = getMeta(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
      <div>
        <h1 className="text-base font-semibold text-foreground">
          {meta.title}
        </h1>
        <p className="text-xs text-muted-foreground">
          {meta.description}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search documents…"
            aria-label="Search documents"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-9 w-64 rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <NotificationBell />

        <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 sm:flex">
          <span className="size-1.5 rounded-full bg-success" />
          <span className="font-mono text-xs text-muted-foreground">
            All systems operational
          </span>
        </div>

        <UserMenu user={user} onLogout={onLogout} />
      </div>
    </header>
  )
}