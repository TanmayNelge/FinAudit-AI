import { useEffect, useState } from 'react'
import { api } from '@/lib/api.js'
import { cn } from '@/lib/utils'
import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { useToast } from '@/components/ui/use-toast.js'
import { ErrorState } from '@/components/ui/state.jsx'
import {
  Loader2,
  Save,
  Bell,
  UserRound,
  CheckCircle2,
  XCircle,
  Check,
  ShieldCheck,
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}

function PreferenceToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
        className={cn(
          'flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-input px-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          checked ? 'bg-primary' : 'bg-muted',
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'size-5 rounded-full bg-background shadow transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  )
}

function SaveButton({ saving, saved }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-60"
    >
      {saving ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : saved ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Save className="size-4" aria-hidden="true" />
      )}
      {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
    </button>
  )
}

function SettingsSkeleton() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  )
}

export function SettingsPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [notifyOnComplete, setNotifyOnComplete] = useState(true)
  const [notifyOnFailed, setNotifyOnFailed] = useState(true)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get('/api/auth/me')
      .then((response) => {
        if (cancelled) return
        const user = response.data.user
        setProfile(user)
        setName(user.name || '')
        setNotifyOnComplete(user.preferences?.notifyOnComplete ?? true)
        setNotifyOnFailed(user.preferences?.notifyOnFailed ?? true)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load settings:', err)
        setError('Unable to load your settings right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const markDirty = (updater) => {
    updater()
    setSaved(false)
    setSaveError('')
    setDirty(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setSaved(false)
    setSaveError('')
    try {
      const response = await api.patch('/api/auth/me', {
        name,
        preferences: { notifyOnComplete, notifyOnFailed },
      })
      setProfile(response.data.user)
      setName(response.data.user.name)
      setSaved(true)
      setDirty(false)
      toast.success('Settings saved.')
    } catch (err) {
      console.error('Failed to save settings:', err)
      setSaveError(
        err.response?.status === 400
          ? err.response.data?.error || 'Please check the values you entered.'
          : 'Unable to save your settings. Please try again.',
      )
      toast.error('Unable to save your settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <SettingsSkeleton />

  if (error || !profile) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col">
        <ErrorState
          icon={XCircle}
          title="Unable to load settings."
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account details and notification preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Account / profile */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="display-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Display name
              </label>
              <input
                id="display-name"
                type="text"
                value={name}
                onChange={(e) => markDirty(() => setName(e.target.value))}
                className="h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Role" value={profile.role === 'admin' ? 'Administrator' : 'Analyst'} />
              <InfoRow label="Member since" value={formatDate(profile.createdAt)} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            Choose which audit events appear in your notification inbox. Changes apply to
            future audits.
          </p>
          <div className="flex flex-col gap-2">
            <PreferenceToggle
              label="Audit completed"
              description="Notify me when a document finishes analysis and receives a compliance score."
              checked={notifyOnComplete}
              onChange={(checked) => markDirty(() => setNotifyOnComplete(checked))}
            />
            <PreferenceToggle
              label="Audit failed"
              description="Notify me when a document cannot be analyzed and is marked as failed."
              checked={notifyOnFailed}
              onChange={(checked) => markDirty(() => setNotifyOnFailed(checked))}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {saveError && (
            <p className="inline-flex items-center gap-1.5 text-xs text-destructive">
              <XCircle className="size-3.5" aria-hidden="true" />
              {saveError}
            </p>
          )}
          {dirty && !saving && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Unsaved changes
            </span>
          )}
          <SaveButton saving={saving} saved={saved && !dirty} />
        </div>
      </form>

      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-4">
        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Email and role changes are not editable here to protect your account. Contact
          your administrator if these need to change.
        </p>
      </div>
    </div>
  )
}