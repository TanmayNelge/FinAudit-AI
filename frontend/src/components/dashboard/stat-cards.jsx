import { FileCheck2, ClockAlert, ShieldX, TrendingUp } from 'lucide-react'

const stats = [
  {
    label: 'Documents Reviewed',
    value: '1,284',
    delta: '+12.4%',
    positive: true,
    icon: FileCheck2,
    accent: 'text-success',
  },
  {
    label: 'Pending Review',
    value: '37',
    delta: '+5 today',
    positive: false,
    icon: ClockAlert,
    accent: 'text-warning',
  },
  {
    label: 'Flagged for Risk',
    value: '7',
    delta: '-2 vs last wk',
    positive: true,
    icon: ShieldX,
    accent: 'text-destructive',
  },
  {
    label: 'Compliance Score',
    value: '98.2%',
    delta: '+0.6%',
    positive: true,
    icon: TrendingUp,
    accent: 'text-primary',
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <Icon className={`size-4 ${stat.accent}`} aria-hidden="true" />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span
                className={`text-xs font-medium ${
                  stat.positive ? 'text-success' : 'text-warning'
                }`}
              >
                {stat.delta}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
