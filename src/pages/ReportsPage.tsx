import { useState } from 'react';
import { runOptimization, DEFAULT_WELL, runCSSSimulation, runSRPSimulation } from '@/lib/simulation';
import type { OptimizationResult } from '@/lib/types';
import { Card, PageHeader, SimulatedBadge, Button } from '@/components/ui';
import { BarChart } from '@/components/Charts';
import { Download, RotateCcw, FileText, CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const currentSettings = {
  steam_rate: DEFAULT_WELL.steam_injection_rate_bpd,
  steam_temp: DEFAULT_WELL.steam_temperature_f,
  injection_pressure: 350,
  srp_speed: DEFAULT_WELL.srp_speed_spm,
  stroke_length: 120,
};

export default function ReportsPage() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const r = runOptimization('balance', currentSettings);
      setResult(r);
      setRunning(false);
    }, 1200);
  };

  const handleDownload = () => {
    if (!result) return;
    const report = {
      title: 'Recommended Operating Plan',
      field: 'Baghewala Field',
      well: 'BW-01',
      date: new Date().toISOString(),
      objective: result.objective,
      current_settings: result.current,
      recommended_settings: result.recommended,
      expected_production_bpd: result.expected_production,
      expected_energy_kw: result.expected_energy,
      detected_risks: result.detected_risks,
      confidence_pct: result.confidence,
      note: 'Simulation-based recommendation — not field-validated.',
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twinnex-report-${Date.now()}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleReset = () => setResult(null);

  // Before/After comparison data
  const beforeAfter = result
    ? [
        { label: 'Oil Prod', before: DEFAULT_WELL.oil_production_bpd, after: result.expected_production, unit: 'BPD', color: '#06b6d4' },
        { label: 'Steam', before: DEFAULT_WELL.steam_injection_rate_bpd, after: result.recommended.steam_rate, unit: 'BPD', color: '#ef4444' },
        { label: 'Energy', before: DEFAULT_WELL.energy_consumption_kw, after: result.expected_energy, unit: 'kW', color: '#f59e0b' },
        { label: 'Temp', before: DEFAULT_WELL.well_temperature_f, after: runCSSSimulation({ steam_rate: result.recommended.steam_rate, steam_temp: result.recommended.steam_temp, injection_pressure: result.recommended.injection_pressure, duration_hrs: 24 }).predicted_temp, unit: '°F', color: '#f97316' },
        { label: 'Pressure', before: DEFAULT_WELL.wellhead_pressure_psi, after: result.recommended.injection_pressure + 1100, unit: 'psi', color: '#3b82f6' },
        { label: 'SRP', before: DEFAULT_WELL.srp_speed_spm, after: result.recommended.srp_speed, unit: 'SPM', color: '#a855f7' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Before vs After comparison and final operating recommendation">
        <SimulatedBadge />
      </PageHeader>

      {!result ? (
        <>
          <Card className="flex items-center justify-center p-12 text-center">
            <div>
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
              <p className="text-sm text-slate-400">Click below to generate the optimization report with before/after comparison.</p>
              <div className="mt-4 flex justify-center">
                <Button onClick={handleRun} disabled={running}>
                  {running ? <><RotateCcw className="h-4 w-4 animate-spin" /> Generating…</> : <><TrendingUp className="h-4 w-4" /> Generate Report</>}
                </Button>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Before vs After comparison */}
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Current Operation vs Optimized Operation</h3>
            <div className="space-y-4">
              {beforeAfter.map((item) => {
                const pct = ((item.after - item.before) / item.before) * 100;
                const improved = item.label === 'Energy' ? pct < 0 : pct > 0;
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label} ({item.unit})</span>
                      <span className={`flex items-center gap-1 text-xs font-bold ${improved ? 'text-green-500' : 'text-red-500'}`}>
                        {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                        {improved ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-6 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full rounded-lg bg-slate-400 dark:bg-slate-500" style={{ width: `${(item.before / Math.max(item.before, item.after)) * 100}%` }} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">Current: {item.before.toFixed(1)} {item.unit}</p>
                      </div>
                      <div className="flex-1">
                        <div className="h-6 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full rounded-lg" style={{ width: `${(item.after / Math.max(item.before, item.after)) * 100}%`, backgroundColor: item.color }} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">Optimized: {item.after.toFixed(1)} {item.unit}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Bar chart comparison */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Production Comparison</h3>
            <BarChart
              data={[
                { label: 'Current', value: DEFAULT_WELL.oil_production_bpd, color: '#94a3b8' },
                { label: 'Optimized', value: result.expected_production, color: '#06b6d4' },
              ]}
              height={180}
              unit=" BPD"
            />
          </Card>

          {/* Final recommendation card */}
          <Card className="border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 dark:from-cyan-950/20 dark:to-teal-950/20">
            <h3 className="mb-4 text-center text-lg font-bold text-slate-800 dark:text-white">Recommended Operating Plan</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-slate-400">Recommended CSS Settings</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Steam Rate</span><span className="font-semibold text-slate-700 dark:text-white">{result.recommended.steam_rate} BPD</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Steam Temp</span><span className="font-semibold text-slate-700 dark:text-white">{result.recommended.steam_temp}°F</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Injection Pressure</span><span className="font-semibold text-slate-700 dark:text-white">{result.recommended.injection_pressure} psi</span></div>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-slate-400">Recommended SRP Settings</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">SRP Speed</span><span className="font-semibold text-slate-700 dark:text-white">{result.recommended.srp_speed} SPM</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Stroke Length</span><span className="font-semibold text-slate-700 dark:text-white">{result.recommended.stroke_length} in</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white/50 dark:bg-slate-800/30 p-3">
                <h4 className="mb-1 text-xs font-semibold uppercase text-slate-400">Expected Results</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Production</span><span className="font-bold text-cyan-500">{result.expected_production} BPD</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Energy</span><span className="font-bold text-amber-500">{result.expected_energy} kW</span></div>
                </div>
              </div>
              <div className="rounded-xl bg-white/50 dark:bg-slate-800/30 p-3">
                <h4 className="mb-1 text-xs font-semibold uppercase text-slate-400">Validation</h4>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-slate-600 dark:text-slate-300">Confidence: {result.confidence}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">Simulation-based — validate with field data.</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3">
              <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-amber-600 dark:text-amber-400"><AlertTriangle className="h-3.5 w-3.5" /> Detected Risks</h4>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {result.detected_risks.map((risk, i) => <li key={i}>• {risk}</li>)}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={handleRun} disabled={running}><RotateCcw className="h-4 w-4" /> Run Again</Button>
              <Button onClick={handleReset} variant="secondary">Reset</Button>
              <Button onClick={handleDownload} variant="secondary"><Download className="h-4 w-4" /> Download Report</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
