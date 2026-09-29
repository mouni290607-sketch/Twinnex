import { useEffect, useState } from 'react';
import { AnomalyEvent } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { detectAnomalies, DEFAULT_WELL } from '@/lib/simulation';
import { Card, PageHeader, StatusBadge, SimulatedBadge } from '@/components/ui';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

const severityConfig = {
  normal: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-900/50' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900/50' },
  critical: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900/50' },
};

export default function AnomaliesPage() {
  const [events, setEvents] = useState<AnomalyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const liveAnomalies = detectAnomalies(DEFAULT_WELL);

  useEffect(() => {
    supabase
      .from('anomaly_events')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setEvents(data as AnomalyEvent[]);
        setLoading(false);
      });

    const channel = supabase
      .channel('anomaly_events:page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomaly_events' }, () => {
        supabase
          .from('anomaly_events')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data: rows }) => {
            if (rows) setEvents(rows as AnomalyEvent[]);
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const counts = { normal: 0, warning: 0, critical: 0 };
  events.forEach((e) => {
    if (e.severity in counts) counts[e.severity as keyof typeof counts]++;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Anomaly Detection" subtitle="AI-based monitoring of abnormal well conditions">
        <SimulatedBadge />
      </PageHeader>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
          <p className="text-2xl font-bold text-green-500">{counts.normal}</p>
          <p className="text-xs text-slate-400">Normal</p>
        </Card>
        <Card className="p-4 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-amber-500" />
          <p className="text-2xl font-bold text-amber-500">{counts.warning}</p>
          <p className="text-xs text-slate-400">Warning</p>
        </Card>
        <Card className="p-4 text-center">
          <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
          <p className="text-2xl font-bold text-red-500">{counts.critical}</p>
          <p className="text-xs text-slate-400">Critical</p>
        </Card>
      </div>

      {/* Live anomaly check */}
      <Card>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Activity className="h-4 w-4 text-cyan-500" /> Real-Time Anomaly Check (Well BW-01)
        </h3>
        <div className="space-y-3">
          {liveAnomalies.map((a, i) => {
            const cfg = severityConfig[a.severity as keyof typeof severityConfig] ?? severityConfig.warning;
            const Icon = cfg.icon;
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.color}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{a.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                    <StatusBadge status={a.severity as any} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Historical anomalies from DB */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">All Well Anomalies</h3>
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">Loading…</div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">No anomalies recorded.</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const cfg = severityConfig[event.severity as keyof typeof severityConfig] ?? severityConfig.warning;
              const Icon = cfg.icon;
              return (
                <div key={event.id} className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500">
                        {event.well_id}
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{event.type.replace(/_/g, ' ')}</p>
                      <StatusBadge status={event.severity as any} />
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{event.description}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{new Date(event.created_at).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
