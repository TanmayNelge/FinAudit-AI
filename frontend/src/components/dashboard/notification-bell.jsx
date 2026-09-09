import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { api } from '@/lib/api.js'
import { usePollTick } from '@/components/ui/use-polling.js'
import { cn } from '@/lib/utils'
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Upload,
  Loader2,
} from 'lucide-react'

function typeMeta(type) {
  if (type === 'completed') {
    return { icon: CheckCircle2, tone: 'text-emerald-400', bar: 'bg-emerald-500' }
  }
  if (type === 'failed') {
    return { icon: XCircle, tone: 'text-destructive', bar: 'bg-destructive' }
  }
  return { icon: Upload, tone: 'text-blue-400', bar: 'bg-blue-500' }
}

function formatRelative(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const emptyMeta = { icon: Upload, tone: 'text-blue-400', bar: 'bg-blue-500' }

export function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const tick = usePollTick()

  // Refetch whenever the shared poll tick advances (every 5s) — no separate timer.
  useEffect(() => {
    let cancelled = false
    const load = () =>
      api
        .get('/api/notifications')
        .then((response) => {
          if (!cancelled) {
            setNotifications(response.data.notifications || [])
            setUnread(response.data.unread || 0)
            setError('')
          }
        })
        .catch((err) => {
          if (cancelled) return
          console.error('Failed to load notifications:', err)
          setError('Unable to load notifications.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })

    load()
    return () => {
      cancelled = true
    }
  }, [tick])

  const markRead = async (id) => {
    const notification = notifications.find((n) => n._id === id)
    if (!notification || notification.read) return
    try {
      const response = await api.patch(`/api/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      )
      setUnread(response.data.unread ?? Math.max(0, unread - 1))
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnread(0)
    } catch (err) {
      console.error('Failed to mark all notifications read:', err)
    }
  }

  const handleOpenChange = (open) => {
    if (!open) return
    if (unread > 0) markAllRead()
  }

  return (
    <PopoverPrimitive.Root onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger
        render={
          <button
            type="button"
            aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
            className="relative flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        }
      >
        {unread > 0 ? (
          <BellRing className="size-4" aria-hidden="true" />
        ) : (
          <Bell className="size-4" aria-hidden="true" />
        )}
        {(unread > 0 || loading) && (
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-semibold leading-4 text-warning-foreground"
          >
            {loading ? '…' : unread}
          </span>
        )}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={8} align="end" className="z-50">
          <PopoverPrimitive.Popup className="w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-xl outline-none">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unread > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 rounded text-xs text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 hover:text-foreground"
                >
                  <CheckCheck className="size-3.5" aria-hidden="true" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {error && (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <Bell className="size-6 text-muted-foreground" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              )}

              {!error && loading && (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span className="text-xs">Loading notifications…</span>
                </div>
              )}

              {!error && !loading && notifications.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Bell className="size-6 text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm font-medium text-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground">
                    Upload a document to start receiving updates.
                  </p>
                </div>
              )}

              {!error &&
                !loading &&
                notifications.length > 0 &&
                notifications.map((notification) => {
                  const meta = typeMeta(notification.type) || emptyMeta
                  const Icon = meta.icon
                  const isUnread = !notification.read
                  return (
                    <div
                      key={notification._id}
                      className={cn(
                        'flex items-start gap-3 border-b border-border px-4 py-3 transition-colors last:border-0',
                        isUnread ? 'bg-secondary/20' : 'bg-transparent',
                      )}
                    >
                      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary', meta.tone)}>
                        <Icon className="size-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {notification.docId ? (
                          <Link
                            to={`/documents/${notification.docId}`}
                            onClick={() => markRead(notification._id)}
                            className="block text-sm text-foreground transition-colors hover:text-primary"
                          >
                            {notification.message}
                          </Link>
                        ) : (
                          <p className="text-sm text-foreground">{notification.message}</p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatRelative(notification.createdAt)}
                        </p>
                      </div>
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markRead(notification._id)}
                          aria-label="Mark as read"
                          className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 hover:bg-secondary hover:text-foreground"
                        >
                          <Check className="size-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )
                })}
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
