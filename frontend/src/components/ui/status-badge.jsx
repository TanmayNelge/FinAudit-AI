import { AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatusBadge({ status, score }) {
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        Auditing
      </span>
    )
  }
  if (status === 'completed') {
    const ok = score >= 80
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
          ok
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
            : 'border-amber-500/20 bg-amber-500/10 text-amber-400',
        )}
      >
        {ok ? (
          <CheckCircle2 className="size-3" aria-hidden="true" />
        ) : (
          <AlertTriangle className="size-3" aria-hidden="true" />
        )}
        {ok ? 'Verified' : 'Needs review'}
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
        Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <Clock className="size-3" aria-hidden="true" />
      Pending
    </span>
  )
}
