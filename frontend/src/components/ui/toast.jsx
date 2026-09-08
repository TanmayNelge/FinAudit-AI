import { useCallback, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToastContext } from '@/components/ui/use-toast.js'

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const ACCENTS = {
  success: 'border-emerald-500/30 text-emerald-400',
  error: 'border-destructive/30 text-destructive',
  info: 'border-border text-primary',
}

const DEFAULT_DURATION = 4000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    ({ type = 'info', title, description, duration = DEFAULT_DURATION }) => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, type, title, description }])
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (title, options = {}) => push({ type: 'success', title, ...options }),
      error: (title, options = {}) => push({ type: 'error', title, ...options }),
      info: (title, options = {}) => push({ type: 'info', title, ...options }),
    }),
    [push],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="false"
          className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
        >
          {toasts.map((t) => {
            const Icon = ICONS[t.type] ?? Info
            return (
              <div
                key={t.id}
                role="status"
                className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-xl"
              >
                <Icon className={cn('mt-0.5 size-4 shrink-0', ACCENTS[t.type])} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}