import { useEffect, useState } from 'react';
import { AnomalyEvent } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Info, AlertTriangle, CheckCircle, XCircle, X, Bell } from 'lucide-react';

interface AlertsPanelProps {
  open: boolean;
  onClose: () => void;
}

const severityConfig = {
  normal: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-100 dark:border-green-900/50' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900/50' },
  critical: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-100 dark:border-red-900/50' },
  info: { icon: Info, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-100 dark:border-cyan-900/50' },
};

export default function AlertsPanel({ open, onClose }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<AnomalyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('anomaly_events')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAlerts(data as AnomalyEvent[]);
        setLoading(false);
      });

    const channel = supabase
      .channel('anomaly_events:all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomaly_events' }, () => {
        supabase
          .from('anomaly_events')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data: rows }) => {
            if (rows) setAlerts(rows as AnomalyEvent[]);
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      )}

      <div
        className={`fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] w-full max-w-sm border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Anomaly Alerts</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-[calc(100%-3.5rem)] overflow-y-auto p-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-400">Loading alerts…</div>
          ) : alerts.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">No anomalies detected.</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, idx) => {
                const cfg = severityConfig[alert.severity as keyof typeof severityConfig] ?? severityConfig.warning;
                const Icon = cfg.icon;
                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 animate-slide-in-right`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.color}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
                            {alert.well_id}
                          </span>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{alert.type.replace(/_/g, ' ')}</h3>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{alert.description}</p>
                        <p className="mt-2 text-[11px] text-slate-400">{new Date(alert.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
