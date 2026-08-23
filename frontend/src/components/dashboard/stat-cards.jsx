import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { FileText, Activity, AlertOctagon, TrendingUp, Loader2 } from 'lucide-react';

export function StatCards() {
  const [metrics, setMetrics] = useState({
    totalAudited: 0,
    avgScore: 0,
    criticalAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/api/analytics');
      setMetrics(response.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch analytics', error);
      setError('Unable to load metrics right now.');
    } finally {
      setLoading(false);
    }
  };

  // Poll every 5 seconds to keep the numbers live as new documents finish auditing
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: 'Total Audits Processed',
      value: loading ? <Loader2 className="size-5 animate-spin" /> : metrics.totalAudited,
      icon: FileText,
      trend: 'All documents ever uploaded',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Average Compliance Score',
      value: loading ? <Loader2 className="size-5 animate-spin" /> : `${metrics.avgScore}/100`,
      icon: Activity,
      trend: metrics.avgScore >= 80 ? 'Optimal Status' : 'Needs Review',
      color: metrics.avgScore >= 80 ? 'text-emerald-500' : 'text-amber-500',
      bg: metrics.avgScore >= 80 ? 'bg-emerald-500/10' : 'bg-amber-500/10'
    },
    {
      title: 'Critical Risk Alerts',
      value: loading ? <Loader2 className="size-5 animate-spin" /> : metrics.criticalAlerts,
      icon: AlertOctagon,
      trend: 'Documents requiring immediate action',
      color: metrics.criticalAlerts > 0 ? 'text-rose-500' : 'text-slate-400',
      bg: metrics.criticalAlerts > 0 ? 'bg-rose-500/10' : 'bg-slate-500/10'
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