import { useState } from 'react';
import { runCSSSimulation, runSRPSimulation } from '@/lib/simulation';
import type { CSSInputs, SRPInputs } from '@/lib/types';
import { LineChart } from '@/components/Charts';
import { Card, PageHeader, SimulatedBadge, Button, InputField } from '@/components/ui';
import { Brain, Play, RotateCcw, Droplet, Thermometer, Gauge, Zap, TrendingUp } from 'lucide-react';

export default function PredictionPage() {
  const [cssInputs, setCssInputs] = useState<CSSInputs>({ steam_rate: 450, steam_temp: 350, injection_pressure: 350, duration_hrs: 24 });
  const [srpInputs, setSrpInputs] = useState<SRPInputs>({ srp_speed: 6.5, stroke_length: 120, pump_condition: 'Good' });
  const [predicted, setPredicted] = useState(false);
  const [running, setRunning] = useState(false);

  const css = runCSSSimulation(cssInputs);
  const srp = runSRPSimulation(srpInputs);

  const predictions = {
    oil_production: ((css.predicted_production + srp.predicted_production) / 2),
    temperature: css.predicted_temp,
    pressure: cssInputs.injection_pressure + 1100,
    oil_flow: css.predicted_oil_flow,
    energy: srp.predicted_energy,
  };

  // Trend data
  const trendData = predicted ? Array.from({ length: 20 }, (_, i) => {
    const t = i / 19;
    const base = predictions.oil_production;
    const noise = (Math.random() - 0.5) * 3;
    return base * (0.95 + t * 0.1) + noise;
  }) : [];

  const handlePredict = () => {
    setRunning(true);
    setTimeout(() => {
      setPredicted(true);
      setRunning(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Next Production & Well Behaviour Prediction" subtitle="AI-based prediction of future operating conditions">
        <SimulatedBadge />
      </PageHeader>

      {/* Input controls */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">CSS Parameters</h3>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Steam Rate" value={cssInputs.steam_rate} onChange={(v) => setCssInputs({ ...cssInputs, steam_rate: v })} unit="BPD" min={100} max={800} />
            <InputField label="Steam Temp" value={cssInputs.steam_temp} onChange={(v) => setCssInputs({ ...cssInputs, steam_temp: v })} unit="°F" min={250} max={500} />
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">SRP Parameters</h3>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="SRP Speed" value={srpInputs.srp_speed} onChange={(v) => setSrpInputs({ ...srpInputs, srp_speed: v })} unit="SPM" min={2} max={12} step={0.5} />
            <InputField label="Stroke" value={srpInputs.stroke_length} onChange={(v) => setSrpInputs({ ...srpInputs, stroke_length: v })} unit="in" min={60} max={200} />
          </div>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handlePredict} disabled={running}>
          {running ? <><RotateCcw className="h-4 w-4 animate-spin" /> Predicting…</> : <><Play className="h-4 w-4" /> Run AI Prediction</>}
        </Button>
      </div>

      {/* Prediction cards */}
      {predicted ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Card className="p-4 text-center">
              <Droplet className="mx-auto mb-2 h-6 w-6 text-cyan-500" />
              <p className="text-xs text-slate-400">Expected Oil Production</p>
              <p className="text-xl font-bold text-cyan-500">{predictions.oil_production.toFixed(1)} BPD</p>
            </Card>
            <Card className="p-4 text-center">
              <Thermometer className="mx-auto mb-2 h-6 w-6 text-orange-500" />
              <p className="text-xs text-slate-400">Expected Temperature</p>
              <p className="text-xl font-bold text-orange-500">{predictions.temperature}°F</p>
            </Card>
            <Card className="p-4 text-center">
              <Gauge className="mx-auto mb-2 h-6 w-6 text-blue-500" />
              <p className="text-xs text-slate-400">Expected Pressure</p>
              <p className="text-xl font-bold text-blue-500">{predictions.pressure} psi</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-teal-500" />
              <p className="text-xs text-slate-400">Expected Oil Flow</p>
              <p className="text-xl font-bold text-teal-500">{predictions.oil_flow.toFixed(1)} BPD</p>
            </Card>
            <Card className="p-4 text-center">
              <Zap className="mx-auto mb-2 h-6 w-6 text-amber-500" />
              <p className="text-xs text-slate-400">Expected Energy</p>
              <p className="text-xl font-bold text-amber-500">{predictions.energy} kW</p>
            </Card>
          </div>

          <Card>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Brain className="h-4 w-4 text-cyan-500" /> Production Trend Prediction (Next Operating Period)
            </h3>
            <LineChart data={trendData} color="#06b6d4" height={200} unit=" BPD" />
            <p className="mt-3 text-center text-xs text-slate-400">
              Model/simulation prediction — not based on actual field measurements
            </p>
          </Card>
        </>
      ) : (
        <Card className="flex items-center justify-center p-12 text-center">
          <div>
            <Brain className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
            <p className="text-sm text-slate-400">Set parameters and click "Run AI Prediction" to forecast production and well behaviour.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
