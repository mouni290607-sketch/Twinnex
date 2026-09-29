import { useLiveData } from '@/lib/useLiveData';
import { LineChart, Gauge } from '@/components/Charts';
import { MetricCard, StatusBadge, SimulatedBadge, LiveBadge, PageHeader, Card } from '@/components/ui';
import type { PageKey } from '@/lib/types';
import { Droplet, Gauge as GaugeIcon, Thermometer, Zap, Flame, Activity, Waves, TrendingUp, Database, Brain, Target, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

const PIPELINE: { key: PageKey; label: string; icon: typeof Database; desc: string }[] = [
  { key: 'dashboard', label: 'Current Condition', icon: Activity, desc: 'Live well status' },
  { key: 'monitoring', label: 'Live Data', icon: Waves, desc: 'Sensor streams' },
  { key: 'css', label: 'CSS Sim', icon: Flame, desc: 'Steam cycle' },
  { key: 'srp', label: 'SRP Sim', icon: TrendingUp, desc: 'Pump tuning' },
  { key: 'digital-twin', label: 'Digital Twin', icon: Database, desc: 'Well-to-surface' },
  { key: 'prediction', label: 'AI Prediction', icon: Brain, desc: 'Next period' },
  { key: 'anomalies', label: 'Anomalies', icon: AlertTriangle, desc: 'Risk detection' },
  { key: 'optimization', label: 'Optimization', icon: Target, desc: 'Best settings' },
  { key: 'reports', label: 'Reports', icon: FileText, desc: 'Final plan' },
];

const IMPACT = [
  { label: 'Economic', value: 'Higher recovery · Lower SOR', icon: TrendingUp, color: 'text-green-500' },
  { label: 'Operational', value: 'Fewer rod failures · Higher uptime', icon: Activity, color: 'text-cyan-500' },
  { label: 'Environmental', value: 'Lower steam & energy per barrel', icon: Zap, color: 'text-teal-500' },
  { label: 'Strategic', value: 'Data-driven digitalization for OIL', icon: Brain, color: 'text-blue-500' },
];

const TECH_STACK = [
  { layer: 'Language', target: 'Python', current: 'TypeScript', status: 'prototype' },
  { layer: 'ML Framework', target: 'PyTorch', current: 'Math models (TS)', status: 'prototype' },
  { layer: 'Core Models', target: 'Physics-Informed Neural Networks', current: 'Thermodynamic approx.', status: 'prototype' },
  { layer: 'Optimization', target: 'Constrained RL / Bayesian', current: 'Grid search', status: 'prototype' },
  { layer: 'Backend', target: 'FastAPI', current: 'Supabase (PostgreSQL)', status: 'active' },
  { layer: 'Frontend', target: 'React', current: 'React + TypeScript', status: 'active' },
  { layer: 'Deployment', target: 'Edge-ready for VFD/SRP', current: 'Web app (Vite)', status: 'prototype' },
];

export default function DashboardPage({ onNavigate }: { onNavigate?: (page: PageKey) => void }) {
  const { reading, history } = useLiveData();

  return (
    <div className="space-y-6">
      <PageHeader title="Current Well Condition" subtitle="Baghewala Field · Well BW-01">
        <div className="flex items-center gap-2">
          <LiveBadge />
          <SimulatedBadge />
          <StatusBadge status={reading.status} />
        </div>
      </PageHeader>

      {/* Five-stage architecture pipeline */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          TWINNEX Pipeline · Baghewala Field (17–19° API Heavy Oil)
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {PIPELINE.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={stage.key} className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate?.(stage.key)}
                  className="group flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 transition hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{stage.label}</p>
                    <p className="text-[10px] text-slate-400">{stage.desc}</p>
                  </div>
                </button>
                {i < PIPELINE.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Impact & benefits */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {IMPACT.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4">
              <Icon className={`mb-2 h-5 w-5 ${item.color}`} />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Technology stack — PPT architecture */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Technology Stack · Production Architecture vs Current Prototype
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                <th className="pb-2 pr-4 text-xs font-semibold text-slate-400">Layer</th>
                <th className="pb-2 pr-4 text-xs font-semibold text-slate-400">PPT Target</th>
                <th className="pb-2 pr-4 text-xs font-semibold text-slate-400">Current Implementation</th>
                <th className="pb-2 text-xs font-semibold text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {TECH_STACK.map((tech) => (
                <tr key={tech.layer} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="py-2.5 pr-4 font-medium text-slate-700 dark:text-slate-200">{tech.layer}</td>
                  <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">{tech.target}</td>
                  <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">{tech.current}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      tech.status === 'active'
                        ? 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400'
                        : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {tech.status === 'active' ? 'Active' : 'Prototype'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          React frontend and Supabase backend are live. Python, PyTorch, PINNs, and FastAPI are the production target — the current prototype demonstrates the full workflow with simulated models ready for ML integration.
        </p>
      </Card>

      {/* Top metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Oil Production" value={reading.oil_production_bpd} unit="BPD" icon={<Droplet className="h-5 w-5" />} color="text-cyan-500" sublabel="Barrels per day" />
        <MetricCard label="Wellhead Pressure" value={reading.wellhead_pressure_psi} unit="psi" icon={<GaugeIcon className="h-5 w-5" />} color="text-blue-500" sublabel="Surface pressure" />
        <MetricCard label="Bottom-Hole Pressure" value={reading.bottomhole_pressure_psi} unit="psi" icon={<Waves className="h-5 w-5" />} color="text-teal-500" sublabel="Reservoir pressure" />
        <MetricCard label="Well Temperature" value={reading.well_temperature_f} unit="°F" icon={<Thermometer className="h-5 w-5" />} color="text-orange-500" sublabel="Wellbore temp" />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Oil Flow Rate" value={reading.oil_flow_rate_bpd} unit="BPD" icon={<Droplet className="h-5 w-5" />} color="text-cyan-500" />
        <MetricCard label="SRP Speed" value={reading.srp_speed_spm} unit="SPM" icon={<Activity className="h-5 w-5" />} color="text-purple-500" sublabel="Strokes per min" />
        <MetricCard label="Steam Injection Rate" value={reading.steam_injection_rate_bpd} unit="BPD" icon={<Flame className="h-5 w-5" />} color="text-red-500" />
        <MetricCard label="Energy Consumption" value={reading.energy_consumption_kw} unit="kW" icon={<Zap className="h-5 w-5" />} color="text-amber-500" />
      </div>

      {/* Gauges + chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Key Gauges</h3>
          <div className="flex flex-wrap items-center justify-around gap-4">
            <Gauge value={reading.oil_production_bpd} min={0} max={120} label="Oil Prod" unit="BPD" color="#06b6d4" />
            <Gauge value={reading.wellhead_pressure_psi} min={0} max={500} label="Pressure" unit="psi" color="#3b82f6" />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Oil Production Trend</h3>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <TrendingUp className="h-3.5 w-3.5" /> Last 60 seconds
            </span>
          </div>
          <LineChart data={history.map((h) => h.oil_production)} color="#06b6d4" height={200} unit=" BPD" />
        </Card>
      </div>

      {/* Steam + SRP charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Steam Injection & Temperature</h3>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs text-slate-400">Steam Rate (BPD)</p>
              <LineChart data={history.map((h) => h.steam_injection)} color="#ef4444" height={120} unit=" BPD" />
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">SRP Performance & Energy</h3>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs text-slate-400">Energy (kW)</p>
              <LineChart data={history.map((h) => h.energy)} color="#f59e0b" height={120} unit=" kW" />
            </div>
          </div>
        </Card>
      </div>

      {/* Well overview table */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Well Overview</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {[
            { label: 'Well ID', value: 'BW-01' },
            { label: 'Status', value: reading.status.toUpperCase() },
            { label: 'Steam Temp', value: `${reading.steam_temperature_f}°F` },
            { label: 'Oil Flow', value: `${reading.oil_flow_rate_bpd} BPD` },
            { label: 'SRP Speed', value: `${reading.srp_speed_spm} SPM` },
            { label: 'Energy', value: `${reading.energy_consumption_kw} kW` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
