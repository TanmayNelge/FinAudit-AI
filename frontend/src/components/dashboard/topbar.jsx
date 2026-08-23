import { Search, Bell, LogOut } from 'lucide-react'

export function Topbar({ user, onLogout, searchTerm = '', onSearchChange }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
      <div>
        <h1 className="text-base font-semibold text-foreground">
          Compliance Overview
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor document reviews and regulatory status
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

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-4" aria-hidden="true" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-warning" />
        </button>

        <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 sm:flex">
          <span className="size-1.5 rounded-full bg-success" />
          <span className="font-mono text-xs text-muted-foreground">
            All systems operational
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          aria-label={`Log out${user?.name ? ` of ${user.name}'s account` : ''}`}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  )
}
