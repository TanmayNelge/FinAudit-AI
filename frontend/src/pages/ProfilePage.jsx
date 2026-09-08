import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api.js'
import { cn } from '@/lib/utils'
import { ErrorState } from '@/components/ui/state.jsx'
import { Mail, ShieldCheck, KeyRound, UserRound, RefreshCw } from 'lucide-react'

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

function InfoField({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      <div className="animate-pulse rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-52 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-card" />
        ))}
      </div>
    </div>
  )
}

export function ProfilePage() {
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
      console.error('Failed to load profile:', err)
      setError('Unable to load your profile right now.')
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
        console.error('Failed to load profile:', err)
        setError('Unable to load your profile right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <ProfileSkeleton />

  if (error || !profile) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col">
        <ErrorState
          icon={UserRound}
          title="Unable to load profile."
          message={error}
          onRetry={fetchProfile}
        />
      </div>
    )
  }

  const role = roleMeta(profile.role)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your FinAudit AI account information.
        </p>
      </div>

      {/* Identity card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xl font-semibold text-primary">
            {getInitials(profile.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {profile.name}
              </h2>
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', role.badge)}>
                {role.label}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" aria-hidden="true" />
              {profile.email}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            <span className="font-mono text-xs text-muted-foreground">Active account</span>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Account details</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoField label="Email" value={profile.email} />
          <InfoField label="Role" value={role.label} />
          <InfoField label="Member since" value={formatDate(profile.createdAt)} />
          <InfoField label="User ID" value={profile._id} />
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border bg-background p-3">
          <KeyRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your password is stored as a salted hash and is never displayed. To
            change your name or notification preferences, use the{' '}
            <Link to="/settings" className="text-primary transition-colors hover:text-primary/80">
              Settings
            </Link>{' '}
            page.
          </p>
        </div>
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