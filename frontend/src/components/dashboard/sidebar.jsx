import { useState } from 'react'
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  UploadCloud,
  AlertTriangle,
  ClipboardList,
  Users,
  Settings,
  LifeBuoy,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const primaryNav = [
  { label: 'Overview', icon: LayoutDashboard, badge: null },
  { label: 'Documents', icon: FileText, badge: '128' },
  { label: 'Upload Queue', icon: UploadCloud, badge: '3' },
  { label: 'Flagged Items', icon: AlertTriangle, badge: '7' },
  { label: 'Audit Trail', icon: ClipboardList, badge: null },
]

const secondaryNav = [
  { label: 'Team', icon: Users },
  { label: 'Settings', icon: Settings },
  { label: 'Support', icon: LifeBuoy },
]

export function Sidebar() {
  const [active, setActive] = useState('Overview')

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-sidebar-foreground">
            Sentinel
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Compliance v4.1
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>
        {primaryNav.map((item) => {
          const Icon = item.icon
          const isActive = active === item.label
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 font-mono text-[10px]',
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}

        <p className="px-3 pb-1 pt-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Manage
        </p>
        {secondaryNav.map((item) => {
          const Icon = item.icon
          const isActive = active === item.label
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-secondary-foreground">
            AW
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              A. Whitmore
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Compliance Officer
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
