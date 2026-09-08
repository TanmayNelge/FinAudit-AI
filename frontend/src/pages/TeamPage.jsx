import { useEffect, useState } from 'react'
import { api } from '@/lib/api.js'
import { cn } from '@/lib/utils'
import { ErrorState } from '@/components/ui/state.jsx'
import {
  Users,
  UserRound,
  ShieldCheck,
  Info,
  Mail,
  RefreshCw,
  FileText,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react'

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name) {
  if (!name) return 'FA'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function roleMeta(role) {
  if (role === 'admin') {
    return { label: 'Administrator', badge: 'border-amber-500/20 bg-amber-500/10 text-amber-400' }
  }
  return { label: 'Analyst', badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' }
}

const permissionRows = [
  { icon: FileText, label: 'Upload & audit documents', value: true },
  { icon: ClipboardList, label: 'Review compliance scores & flagged issues', value: true },
  { icon: AlertTriangle, label: 'Manage and delete documents', value: true },
  { icon: ShieldCheck, label: 'Manage team members & roles', value: 'admin-only' },
]

function InfoField({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}

function TeamSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="h-5 w-20 animate-pulse rounded bg-muted" />
      <div className="animate-pulse rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-3 w-52 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  )
}

export function TeamPage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/api/auth/me')
      setProfile(response.data.user)
    } catch (err) {
      console.error('Failed to load team info:', err)
      setError('Unable to load your team information right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    api
      .get('/api/auth/me')
      .then((response) => {
        if (!cancelled) setProfile(response.data.user)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load team info:', err)
        setError('Unable to load your team information right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <TeamSkeleton />

  if (error || !profile) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col">
        <ErrorState
          icon={Users}
          title="Unable to load team information."
          message={error}
          onRetry={fetchProfile}
        />
      </div>
    )
  }

  const role = roleMeta(profile.role)
  const isAdmin = profile.role === 'admin'

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Workspace members, roles and permissions.
        </p>
      </div>

      {/* Scoping notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          This workspace is currently configured as a <span className="font-medium text-foreground">single-user workspace</span>.
          Team member management and invite flows are not part of this build, so only your
          own account and permissions are shown here.
        </p>
      </div>

      {/* Current member */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-lg font-semibold text-primary">
            {getInitials(profile.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                {profile.name}
              </h2>
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', role.badge)}>
                {role.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Member
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" aria-hidden="true" />
              {profile.email}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <InfoField label="Role" value={role.label} />
          <InfoField label="Member since" value={formatDate(profile.createdAt)} />
          <InfoField label="User ID" value={profile._id} />
        </div>
      </div>

      {/* Permissions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Permissions</h2>
        </div>
        <ul className="flex flex-col gap-2">
          {permissionRows.map((permission) => {
            const Icon = permission.icon
            return (
              <li
                key={permission.label}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3"
              >
                <span className="flex items-center gap-2.5 text-sm text-foreground">
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {permission.label}
                </span>
                {permission.value === true ? (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    Enabled
                  </span>
                ) : permission.value === 'admin-only' ? (
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      isAdmin
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border-border bg-secondary text-muted-foreground',
                    )}
                  >
                    {isAdmin ? 'Enabled' : 'Admin only'}
                  </span>
                ) : (
                  <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Not available
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Membership summary */}
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-4">
        <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          You are the only member of this workspace. When multi-user team management
          is introduced, this panel will list collaborators and their roles.
        </p>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={fetchProfile}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Refresh
        </button>
      </div>
    </div>
  )
}