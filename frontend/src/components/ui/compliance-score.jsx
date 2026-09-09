import { cn } from '@/lib/utils'

export function ComplianceScore({ status, score, size = 'sm' }) {
  if (status !== 'completed' || score == null) {
    return <span className={cn('font-mono text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>--</span>
  }
  const ok = score >= 80
  return (
    <span
      className={cn(
        'font-mono font-semibold',
        size === 'sm' ? 'text-sm' : 'text-xs',
        ok ? 'text-emerald-400' : 'text-amber-400',
      )}
    >
      {score}%
    </span>
  )
}
