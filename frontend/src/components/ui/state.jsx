import { Loader2 } from 'lucide-react'

export function LoadingState({ label = 'Loading…', className }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className ?? ''}`}>
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={`flex flex-col items-center gap-3 px-6 py-14 text-center ${className ?? ''}`}>
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        {Icon && <Icon className="size-6" aria-hidden="true" />}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function ErrorState({ icon: Icon, title, message, onRetry, retryLabel = 'Try again', className }) {
  return (
    <div className={`flex flex-col items-center gap-3 px-6 py-12 text-center ${className ?? ''}`}>
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        {Icon && <Icon className="size-6" aria-hidden="true" />}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {message && <p className="mt-1 text-xs text-muted-foreground">{message}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}
