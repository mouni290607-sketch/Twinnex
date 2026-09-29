import { useLiveData } from '@/lib/useLiveData';
import { MultiLineChart, LineChart } from '@/components/Charts';
import { Card, LiveBadge, SimulatedBadge, PageHeader } from '@/components/ui';

export default function MonitoringPage() {
  const { reading, history } = useLiveData();
  const labels = history.slice(-10).map((h) => h.time.slice(0, 5));

  return (
    <div className="space-y-6">
      <PageHeader title="Live Monitoring" subtitle="Real-time sensor data · Baghewala Field">
        <div className="flex items-center gap-2">
          <LiveBadge />
          <SimulatedBadge />
        </div>
      </PageHeader>

      {/* Temperature & Pressure */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Temperature</h3>
          <p className="mb-3 text-xs text-slate-400">Wellbore temperature (°F)</p>
          <LineChart data={history.map((h) => h.temperature)} color="#f97316" height={180} unit="°F" />
        </Card>
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Pressure</h3>
          <p className="mb-3 text-xs text-slate-400">Wellhead pressure (psi)</p>
          <LineChart data={history.map((h) => h.pressure)} color="#3b82f6" height={180} unit=" psi" />
        </Card>
      </div>

      {/* Oil Production & Steam */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Oil Production</h3>
          <p className="mb-3 text-xs text-slate-400">Live production rate (BPD)</p>
          <LineChart data={history.map((h) => h.oil_production)} color="#06b6d4" height={180} unit=" BPD" />
        </Card>
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Steam Injection</h3>
          <p className="mb-3 text-xs text-slate-400">Steam injection rate (BPD)</p>
          <LineChart data={history.map((h) => h.steam_injection)} color="#ef4444" height={180} unit=" BPD" />
        </Card>
      </div>

      {/* SRP & Energy */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">SRP Performance</h3>
          <p className="mb-3 text-xs text-slate-400">Pump performance index</p>
          <LineChart data={history.map((h) => h.srp_performance)} color="#a855f7" height={180} unit="" />
        </Card>
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Energy Consumption</h3>
          <p className="mb-3 text-xs text-slate-400">Power usage (kW)</p>
          <LineChart data={history.map((h) => h.energy)} color="#f59e0b" height={180} unit=" kW" />
        </Card>
      </div>

      {/* Combined view */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Combined Sensor View</h3>
        <MultiLineChart
          series={[
            { name: 'Oil Prod', data: history.map((h) => h.oil_production), color: '#06b6d4' },
            { name: 'Pressure', data: history.map((h) => h.pressure), color: '#3b82f6' },
            { name: 'Energy', data: history.map((h) => h.energy), color: '#f59e0b' },
          ]}
          labels={labels}
          height={220}
        />
      </Card>

      {/* Current values strip */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Current Sensor Readings</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Temperature', value: `${reading.well_temperature_f}°F`, color: 'text-orange-500' },
            { label: 'Pressure', value: `${reading.wellhead_pressure_psi} psi`, color: 'text-blue-500' },
            { label: 'Oil Prod', value: `${reading.oil_production_bpd} BPD`, color: 'text-cyan-500' },
            { label: 'Steam', value: `${reading.steam_injection_rate_bpd} BPD`, color: 'text-red-500' },
            { label: 'SRP Perf', value: `${(reading.srp_speed_spm * 10).toFixed(1)}`, color: 'text-purple-500' },
            { label: 'Energy', value: `${reading.energy_consumption_kw} kW`, color: 'text-amber-500' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className={`mt-1 text-lg font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
