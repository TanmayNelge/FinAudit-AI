import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { usePollTick } from '@/components/ui/use-polling.js';
import { FileText, Activity, AlertOctagon, TrendingUp, Loader2 } from 'lucide-react';

export function StatCards() {
  const [metrics, setMetrics] = useState({
    totalAudited: 0,
    avgScore: 0,
    criticalAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tick = usePollTick();

  // Refetch whenever the shared poll tick advances (every 5s), keeping the
  // numbers live as new documents finish auditing — without a second timer.
  useEffect(() => {
    let cancelled = false;

    const load = () =>
      api.get('/api/analytics')
        .then((response) => {
          if (!cancelled) {
            setMetrics(response.data);
            setError('');
          }
        })
        .catch((error) => {
          if (!cancelled) {
            console.error('Failed to fetch analytics', error);
            setError('Unable to load metrics right now.');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

    load();
    return () => { cancelled = true; };
  }, [tick]);

  const cards = [
    {
      title: 'Total Audits Processed',
      value: loading ? <Loader2 className="size-5 animate-spin" /> : metrics.totalAudited,
      icon: FileText,
      trend: 'All documents ever uploaded',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Average Compliance Score',
      value: loading ? <Loader2 className="size-5 animate-spin" /> : `${metrics.avgScore}/100`,
      icon: Activity,
      trend: metrics.avgScore >= 80 ? 'Optimal Status' : 'Needs Review',
      color: metrics.avgScore >= 80 ? 'text-emerald-400' : 'text-amber-400',
      bg: metrics.avgScore >= 80 ? 'bg-emerald-500/10' : 'bg-amber-500/10'
    },
    {
      title: 'Critical Risk Alerts',
      value: loading ? <Loader2 className="size-5 animate-spin" /> : metrics.criticalAlerts,
      icon: AlertOctagon,
      trend: 'Documents requiring immediate action',
      color: metrics.criticalAlerts > 0 ? 'text-destructive' : 'text-muted-foreground',
      bg: metrics.criticalAlerts > 0 ? 'bg-destructive/10' : 'bg-muted'
    }
  ];

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
            <div className={`rounded-md p-2 ${card.bg}`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {card.value}
            </div>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3" />
              {card.trend}
            </p>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}