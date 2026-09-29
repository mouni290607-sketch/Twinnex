import { useState } from 'react';
import { runCSSSimulation } from '@/lib/simulation';
import type { CSSInputs, CSSOutputs } from '@/lib/types';
import { LineChart } from '@/components/Charts';
import { Card, PageHeader, InputField, Button, SimulatedBadge } from '@/components/ui';
import { Flame, Play, RotateCcw, Thermometer, Droplet, TrendingUp } from 'lucide-react';

const DEFAULT_INPUTS: CSSInputs = { steam_rate: 450, steam_temp: 350, injection_pressure: 350, duration_hrs: 24 };

export default function CSSPage() {
  const [inputs, setInputs] = useState<CSSInputs>(DEFAULT_INPUTS);
  const [outputs, setOutputs] = useState<CSSOutputs | null>(null);
  const [running, setRunning] = useState(false);
  const [chartData, setChartData] = useState<{ temp: number[]; flow: number[]; prod: number[]; steam: number[] }>({
    temp: [], flow: [], prod: [], steam: [],
  });

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const result = runCSSSimulation(inputs);
      setOutputs(result);
      // Generate time-series for charts
      const temp: number[] = [];
      const flow: number[] = [];
      const prod: number[] = [];
      const steam: number[] = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        temp.push(180 + (result.predicted_temp - 180) * (1 - Math.exp(-3 * t)));
        flow.push(85.2 + (result.predicted_oil_flow - 85.2) * (1 - Math.exp(-2.5 * t)));
        prod.push(85.2 + (result.predicted_production - 85.2) * (1 - Math.exp(-2 * t)));
        steam.push(inputs.steam_rate * (1 - t * 0.15));
      }
      setChartData({ temp, flow, prod, steam });
      setRunning(false);
    }, 800);
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setOutputs(null);
    setChartData({ temp: [], flow: [], prod: [], steam: [] });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="CSS Control & Simulation" subtitle="Cyclic Steam Stimulation · Steam injection → viscosity reduction → improved flow">
        <SimulatedBadge />
      </PageHeader>

      {/* Process flow */}
      <Card>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {['Steam Injection', 'Heating Heavy Oil', 'Viscosity Reduction', 'Improved Oil Flow'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {step}
              </span>
              {i < 3 && <span className="text-slate-300 dark:text-slate-600">→</span>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Flame className="h-4 w-4 text-red-500" /> CSS Input Parameters
          </h3>
          <div className="space-y-4">
            <InputField label="Steam Injection Rate" value={inputs.steam_rate} onChange={(v) => setInputs({ ...inputs, steam_rate: v })} unit="BPD" min={100} max={800} />
            <InputField label="Steam Temperature" value={inputs.steam_temp} onChange={(v) => setInputs({ ...inputs, steam_temp: v })} unit="°F" min={250} max={500} />
            <InputField label="Injection Pressure" value={inputs.injection_pressure} onChange={(v) => setInputs({ ...inputs, injection_pressure: v })} unit="psi" min={100} max={600} />
            <InputField label="Injection Duration" value={inputs.duration_hrs} onChange={(v) => setInputs({ ...inputs, duration_hrs: v })} unit="hrs" min={4} max={72} />
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={handleRun} disabled={running}>
              {running ? <><RotateCcw className="h-4 w-4 animate-spin" /> Simulating…</> : <><Play className="h-4 w-4" /> Run CSS Simulation</>}
            </Button>
            <Button variant="secondary" onClick={handleReset}><RotateCcw className="h-4 w-4" /> Reset</Button>
          </div>
        </Card>

        {/* Output panel */}
        <div className="space-y-4">
          {outputs ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><Thermometer className="h-4 w-4 text-orange-500" /> Predicted Temp</div>
                  <p className="mt-1 text-2xl font-bold text-orange-500">{outputs.predicted_temp}<span className="text-sm text-slate-400">°F</span></p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><Droplet className="h-4 w-4 text-cyan-500" /> Predicted Oil Flow</div>
                  <p className="mt-1 text-2xl font-bold text-cyan-500">{outputs.predicted_oil_flow}<span className="text-sm text-slate-400"> BPD</span></p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><TrendingUp className="h-4 w-4 text-green-500" /> Predicted Production</div>
                  <p className="mt-1 text-2xl font-bold text-green-500">{outputs.predicted_production}<span className="text-sm text-slate-400"> BPD</span></p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><Flame className="h-4 w-4 text-red-500" /> Steam Consumption</div>
                  <p className="mt-1 text-2xl font-bold text-red-500">{outputs.predicted_steam_consumption}<span className="text-sm text-slate-400"> bbl</span></p>
                </Card>
              </div>
            </>
          ) : (
            <Card className="flex h-full items-center justify-center p-12 text-center">
              <div>
                <Flame className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
                <p className="text-sm text-slate-400">Enter CSS parameters and click "Run CSS Simulation" to see predicted results.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Charts */}
      {outputs && chartData.temp.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Temperature Rise Over Time</h3>
            <LineChart data={chartData.temp} color="#f97316" height={180} unit="°F" />
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Oil Flow Improvement</h3>
            <LineChart data={chartData.flow} color="#06b6d4" height={180} unit=" BPD" />
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Production Forecast</h3>
            <LineChart data={chartData.prod} color="#10b981" height={180} unit=" BPD" />
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Steam Consumption</h3>
            <LineChart data={chartData.steam} color="#ef4444" height={180} unit=" BPD" />
          </Card>
        </div>
      )}
    </div>
  );
}
