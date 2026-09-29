import { useState } from 'react';
import { runOptimization, DEFAULT_WELL } from '@/lib/simulation';
import type { OptimizationResult } from '@/lib/types';
import { Card, PageHeader, SimulatedBadge, Button } from '@/components/ui';
import { BarChart } from '@/components/Charts';
import { TrendingUp, Target, Zap, AlertTriangle, CheckCircle, RotateCcw, ArrowRight } from 'lucide-react';

const objectives = [
  { key: 'maximize_production' as const, label: 'Maximize Oil Production', icon: TrendingUp },
  { key: 'reduce_energy' as const, label: 'Reduce Energy Consumption', icon: Zap },
  { key: 'balance' as const, label: 'Balance Production & Energy', icon: Target },
];

const currentSettings = {
  steam_rate: DEFAULT_WELL.steam_injection_rate_bpd,
  steam_temp: DEFAULT_WELL.steam_temperature_f,
  injection_pressure: 350,
  srp_speed: DEFAULT_WELL.srp_speed_spm,
  stroke_length: 120,
};

export default function OptimizationPage() {
  const [objective, setObjective] = useState<OptimizationResult['objective']>('balance');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const r = runOptimization(objective, currentSettings);
      setResult(r);
      setRunning(false);
    }, 1200);
  };

  const handleReset = () => setResult(null);

  const settingsKeys: { key: keyof OptimizationResult['current']; label: string; unit: string }[] = [
    { key: 'steam_rate', label: 'Steam Rate', unit: 'BPD' },
    { key: 'steam_temp', label: 'Steam Temp', unit: '°F' },
    { key: 'injection_pressure', label: 'Injection Pressure', unit: 'psi' },
    { key: 'srp_speed', label: 'SRP Speed', unit: 'SPM' },
    { key: 'stroke_length', label: 'Stroke Length', unit: 'in' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Well Optimization Recommendation" subtitle="Optimal CSS & SRP settings based on selected objective">
        <SimulatedBadge />
      </PageHeader>

      {/* Objective selector */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {objectives.map((obj) => {
          const Icon = obj.icon;
          const active = objective === obj.key;
          return (
            <button
              key={obj.key}
              onClick={() => setObjective(obj.key)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">{obj.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button onClick={handleRun} disabled={running}>
          {running ? <><RotateCcw className="h-4 w-4 animate-spin" /> Optimizing…</> : <><TrendingUp className="h-4 w-4" /> Run Optimization</>}
        </Button>
      </div>

      {result ? (
        <>
          {/* Current → Recommended */}
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Current Settings → Recommended Settings</h3>
            <div className="space-y-3">
              {settingsKeys.map((s) => {
                const current = result.current[s.key];
                const recommended = result.recommended[s.key];
                const changed = current !== recommended;
                const diff = changed ? (((recommended - current) / current) * 100).toFixed(1) : '0';
                return (
                  <div key={s.key} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">{s.label}</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{current} {s.unit}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">Recommended</p>
                      <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{recommended} {s.unit}</p>
                    </div>
                    {changed && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${Number(diff) > 0 ? 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'}`}>
                        {Number(diff) > 0 ? '+' : ''}{diff}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Expected outcomes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-cyan-500" />
              <p className="text-xs text-slate-400">Expected Production</p>
              <p className="text-2xl font-bold text-cyan-500">{result.expected_production} BPD</p>
            </Card>
            <Card className="p-4 text-center">
              <Zap className="mx-auto mb-2 h-6 w-6 text-amber-500" />
              <p className="text-xs text-slate-400">Expected Energy</p>
              <p className="text-2xl font-bold text-amber-500">{result.expected_energy} kW</p>
            </Card>
          </div>

          {/* Risks */}
          <Card>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Detected Risks
            </h3>
            <div className="space-y-2">
              {result.detected_risks.map((risk, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-600 dark:text-slate-300">
                  {risk.includes('No significant') ? <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />}
                  {risk}
                </div>
              ))}
            </div>
          </Card>

          {/* Confidence */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Confidence Level</p>
                <p className="text-lg font-bold text-slate-700 dark:text-white">{result.confidence}%</p>
              </div>
              <div className="h-3 w-40 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500" style={{ width: `${result.confidence}%` }} />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Simulation-based recommendation — not field-validated. Validate with actual Baghewala data before deployment.
            </p>
          </Card>

          <div className="flex justify-center gap-3">
            <Button onClick={handleRun} variant="secondary"><RotateCcw className="h-4 w-4" /> Run Again</Button>
            <Button onClick={handleReset} variant="ghost">Clear</Button>
          </div>
        </>
      ) : (
        <Card className="flex items-center justify-center p-12 text-center">
          <div>
            <Target className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
            <p className="text-sm text-slate-400">Select an optimization objective and click "Run Optimization" to get recommended settings.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
