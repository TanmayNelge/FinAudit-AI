import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SortHeader({ label, sortKey, activeKey, sortDir, onSort }) {
  const isActive = activeKey === sortKey
  const Icon = isActive ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 transition-colors',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      <Icon className={cn('size-3.5', !isActive && 'opacity-60')} aria-hidden="true" />
    </button>
  )
}