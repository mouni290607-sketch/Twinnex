import { useState } from 'react';
import { Card, PageHeader, SimulatedBadge, Button, InputField } from '@/components/ui';
import { runCSSSimulation, runSRPSimulation } from '@/lib/simulation';
import type { CSSInputs, SRPInputs } from '@/lib/types';
import { Box, Flame, Wrench, Droplet, Thermometer, Activity, Zap, ArrowDown, Layers } from 'lucide-react';

export default function DigitalTwinPage() {
  const [cssInputs, setCssInputs] = useState<CSSInputs>({ steam_rate: 450, steam_temp: 350, injection_pressure: 350, duration_hrs: 24 });
  const [srpInputs, setSrpInputs] = useState<SRPInputs>({ srp_speed: 6.5, stroke_length: 120, pump_condition: 'Good' });
  const [updated, setUpdated] = useState(false);

  const css = runCSSSimulation(cssInputs);
  const srp = runSRPSimulation(srpInputs);

  const handleUpdate = () => {
    setUpdated(true);
    setTimeout(() => setUpdated(false), 1000);
  };

  // Flow stages from reservoir to surface
  const stages = [
    { label: 'Reservoir', icon: Layers, value: '1450 psi', color: 'from-slate-500 to-slate-700', desc: 'Heavy oil reservoir zone' },
    { label: 'Heavy Oil', icon: Droplet, value: `${css.predicted_oil_flow} BPD`, color: 'from-amber-600 to-amber-800', desc: 'Viscosity reduced by CSS' },
    { label: 'Wellbore', icon: Box, value: `${css.predicted_temp}°F`, color: 'from-orange-500 to-red-600', desc: 'Heated by steam injection' },
    { label: 'CSS Steam', icon: Flame, value: `${cssInputs.steam_rate} BPD`, color: 'from-red-500 to-red-700', desc: `${cssInputs.steam_temp}°F @ ${cssInputs.injection_pressure} psi` },
    { label: 'SRP Pump', icon: Wrench, value: `${srpInputs.srp_speed} SPM`, color: 'from-purple-500 to-purple-700', desc: `${srp.predicted_pump_perf}% efficiency` },
    { label: 'Surface', icon: Activity, value: `${srp.predicted_production} BPD`, color: 'from-cyan-500 to-blue-600', desc: 'Surface production output' },
    { label: 'Production', icon: Zap, value: `${srp.predicted_energy} kW`, color: 'from-green-500 to-teal-600', desc: 'Energy consumption' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Digital Twin" subtitle="Well-to-surface flow visualization · Reservoir → Production">
        <SimulatedBadge />
      </PageHeader>

      {/* Input controls */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Flame className="h-4 w-4 text-red-500" /> CSS Parameters
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Steam Rate" value={cssInputs.steam_rate} onChange={(v) => setCssInputs({ ...cssInputs, steam_rate: v })} unit="BPD" min={100} max={800} />
            <InputField label="Steam Temp" value={cssInputs.steam_temp} onChange={(v) => setCssInputs({ ...cssInputs, steam_temp: v })} unit="°F" min={250} max={500} />
            <InputField label="Pressure" value={cssInputs.injection_pressure} onChange={(v) => setCssInputs({ ...cssInputs, injection_pressure: v })} unit="psi" min={100} max={600} />
            <InputField label="Duration" value={cssInputs.duration_hrs} onChange={(v) => setCssInputs({ ...cssInputs, duration_hrs: v })} unit="hrs" min={4} max={72} />
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Wrench className="h-4 w-4 text-purple-500" /> SRP Parameters
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="SRP Speed" value={srpInputs.srp_speed} onChange={(v) => setSrpInputs({ ...srpInputs, srp_speed: v })} unit="SPM" min={2} max={12} step={0.5} />
            <InputField label="Stroke Length" value={srpInputs.stroke_length} onChange={(v) => setSrpInputs({ ...srpInputs, stroke_length: v })} unit="in" min={60} max={200} />
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Pump Condition</label>
              <select
                value={srpInputs.pump_condition}
                onChange={(e) => setSrpInputs({ ...srpInputs, pump_condition: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-slate-800 dark:text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleUpdate}>
          <Activity className={`h-4 w-4 ${updated ? 'animate-spin' : ''}`} /> Update Digital Twin
        </Button>
      </div>

      {/* Digital Twin visualization */}
      <Card className={`transition-all ${updated ? 'ring-2 ring-cyan-500' : ''}`}>
        <h3 className="mb-6 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
          Complete Well-to-Surface Flow
        </h3>

        {/* Vertical flow diagram */}
        <div className="mx-auto max-w-2xl space-y-2">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={stage.label}>
                <div className={`flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${stage.color} p-4 text-white animate-slide-up`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{stage.label}</p>
                    <p className="text-xs text-white/70">{stage.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{stage.value}</p>
                  </div>
                </div>
                {i < stages.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <Thermometer className="mx-auto mb-2 h-6 w-6 text-orange-500" />
          <p className="text-xs text-slate-400">Predicted Well Temp</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{css.predicted_temp}°F</p>
        </Card>
        <Card className="p-4 text-center">
          <Droplet className="mx-auto mb-2 h-6 w-6 text-cyan-500" />
          <p className="text-xs text-slate-400">Predicted Production</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{srp.predicted_production} BPD</p>
        </Card>
        <Card className="p-4 text-center">
          <Zap className="mx-auto mb-2 h-6 w-6 text-amber-500" />
          <p className="text-xs text-slate-400">Energy Consumption</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{srp.predicted_energy} kW</p>
        </Card>
      </div>
    </div>
  );
}
