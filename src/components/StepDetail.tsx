import { useEffect, useState } from 'react';
import { WorkflowStep, StepData } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import {
  Database, Filter, BrainCircuit, Play, Rocket, Activity,
  Workflow, Loader2, ArrowRight, TrendingUp, GitCommit, FlaskConical,
} from 'lucide-react';
import { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Database, Filter, BrainCircuit, Play, Rocket, Activity, Workflow,
};

export default function StepDetail({ step }: { step: WorkflowStep }) {
  const [data, setData] = useState<StepData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('step_data')
      .select('*')
      .eq('step_id', step.id)
      .order('created_at', { ascending: false })
      .then(({ data: rows, error }) => {
        if (cancelled) return;
        if (!error && rows) setData(rows as StepData[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`step_data:${step.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'step_data', filter: `step_id=eq.${step.id}` },
        () => {
          supabase
            .from('step_data')
            .select('*')
            .eq('step_id', step.id)
            .order('created_at', { ascending: false })
            .then(({ data: rows }) => {
              if (!cancelled && rows) setData(rows as StepData[]);
            });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [step.id]);

  const Icon = iconMap[step.icon] ?? Workflow;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-50 dark:bg-brand-900/30 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                Step {step.order}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {step.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {step.description}
            </p>
          </div>
        </div>
      </div>

      {/* Data cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-gray-500 dark:text-gray-400">
          No data available for this step yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((item, idx) => (
            <div
              key={item.id}
              className="glass-strong rounded-2xl p-5 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <span className="h-2 w-2 rounded-full bg-accent-500" />
                {item.label}
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Current State */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                    <TrendingUp className="h-4 w-4 text-brand-500" />
                    Current State
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {item.current_state}
                  </p>
                </div>

                {/* Changes */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                    <GitCommit className="h-4 w-4 text-accent-500" />
                    Changes
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {item.changes}
                  </p>
                </div>

                {/* Simulation Result */}
                <div className="rounded-xl border border-brand-100 dark:border-brand-900/30 bg-brand-50/40 dark:bg-brand-900/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-brand-500 dark:text-brand-400">
                    <FlaskConical className="h-4 w-4" />
                    Simulation Outcome
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {item.simulation_result}
                  </p>
                </div>
              </div>

              {/* Flow arrow */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600">
                <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1">Current State</span>
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1">Changes</span>
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="rounded-full bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-brand-500 dark:text-brand-400">
                  Simulation Result
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
