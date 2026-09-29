import { useState } from 'react';
import { runSRPSimulation } from '@/lib/simulation';
import type { SRPInputs, SRPOutputs } from '@/lib/types';
import { LineChart } from '@/components/Charts';
import { Card, PageHeader, InputField, Button, SimulatedBadge } from '@/components/ui';
import { Wrench, Play, RotateCcw, Droplet, Zap, AlertCircle, Activity } from 'lucide-react';

const DEFAULT_INPUTS: SRPInputs = { srp_speed: 6.5, stroke_length: 120, pump_condition: 'Good' };

export default function SRPPage() {
  const [inputs, setInputs] = useState<SRPInputs>(DEFAULT_INPUTS);
  const [outputs, setOutputs] = useState<SRPOutputs | null>(null);
  const [running, setRunning] = useState(false);
  const [chartData, setChartData] = useState<{ prod: number[]; perf: number[]; energy: number[] }>({
    prod: [], perf: [], energy: [],
  });

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const result = runSRPSimulation(inputs);
      setOutputs(result);
      const prod: number[] = [];
      const perf: number[] = [];
      const energy: number[] = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        prod.push(85.2 + (result.predicted_production - 85.2) * (1 - Math.exp(-3 * t)));
        perf.push(70 + (result.predicted_pump_perf - 70) * (1 - Math.exp(-2.5 * t)));
        energy.push(42.5 + (result.predicted_energy - 42.5) * (1 - Math.exp(-2 * t)));
      }
      setChartData({ prod, perf, energy });
      setRunning(false);
    }, 800);
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setOutputs(null);
    setChartData({ prod: [], perf: [], energy: [] });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="SRP Control & Simulation" subtitle="Sucker Rod Pump · Speed & stroke optimization">
        <SimulatedBadge />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Wrench className="h-4 w-4 text-purple-500" /> SRP Input Parameters
          </h3>
          <div className="space-y-4">
            <InputField label="SRP Speed (SPM)" value={inputs.srp_speed} onChange={(v) => setInputs({ ...inputs, srp_speed: v })} unit="SPM" min={2} max={12} step={0.5} />
            <InputField label="Pump Stroke Length" value={inputs.stroke_length} onChange={(v) => setInputs({ ...inputs, stroke_length: v })} unit="in" min={60} max={200} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Pump Operating Condition</label>
              <select
                value={inputs.pump_condition}
                onChange={(e) => setInputs({ ...inputs, pump_condition: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-slate-800 dark:text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={handleRun} disabled={running}>
              {running ? <><RotateCcw className="h-4 w-4 animate-spin" /> Simulating…</> : <><Play className="h-4 w-4" /> Run SRP Simulation</>}
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
                  <div className="flex items-center gap-2 text-xs text-slate-400"><Droplet className="h-4 w-4 text-cyan-500" /> Predicted Production</div>
                  <p className="mt-1 text-2xl font-bold text-cyan-500">{outputs.predicted_production}<span className="text-sm text-slate-400"> BPD</span></p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><Activity className="h-4 w-4 text-purple-500" /> Pump Performance</div>
                  <p className="mt-1 text-2xl font-bold text-purple-500">{outputs.predicted_pump_perf}<span className="text-sm text-slate-400">%</span></p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><Zap className="h-4 w-4 text-amber-500" /> Energy Consumption</div>
                  <p className="mt-1 text-2xl font-bold text-amber-500">{outputs.predicted_energy}<span className="text-sm text-slate-400"> kW</span></p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><AlertCircle className="h-4 w-4 text-red-500" /> Pump Problems</div>
                  <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">{outputs.predicted_problems}</p>
                </Card>
              </div>
            </>
          ) : (
            <Card className="flex h-full items-center justify-center p-12 text-center">
              <div>
                <Wrench className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
                <p className="text-sm text-slate-400">Enter SRP parameters and click "Run SRP Simulation" to see predicted results.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Charts */}
      {outputs && chartData.prod.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Oil Production</h3>
            <LineChart data={chartData.prod} color="#06b6d4" height={160} unit=" BPD" />
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Pump Performance</h3>
            <LineChart data={chartData.perf} color="#a855f7" height={160} unit="%" />
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Energy Consumption</h3>
            <LineChart data={chartData.energy} color="#f59e0b" height={160} unit=" kW" />
          </Card>
        </div>
      )}
    </div>
  );
}
