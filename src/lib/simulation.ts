import type {
  CSSInputs, CSSOutputs, SRPInputs, SRPOutputs, OptimizationResult, WellStatus, Severity,
} from './types';

// Default Baghewala well baseline values (simulated)
export const DEFAULT_WELL = {
  oil_production_bpd: 85.2,
  wellhead_pressure_psi: 320,
  bottomhole_pressure_psi: 1450,
  well_temperature_f: 210,
  oil_flow_rate_bpd: 85.2,
  srp_speed_spm: 6.5,
  steam_injection_rate_bpd: 450,
  steam_temperature_f: 350,
  energy_consumption_kw: 42.5,
};

export const WELLS = ['BW-01', 'BW-02', 'BW-03', 'BW-04', 'BW-05', 'BW-06'];

// CSS simulation: steam injection → heating → viscosity reduction → improved flow
export function runCSSSimulation(inputs: CSSInputs): CSSOutputs {
  const { steam_rate, steam_temp, injection_pressure, duration_hrs } = inputs;

  // Heat transfer model (simplified thermodynamic approximation)
  const heatInput = steam_rate * (steam_temp - 60) * 0.0008 * duration_hrs;
  const viscosityReduction = Math.min(0.65, heatInput * 0.4 + (injection_pressure - 200) / 1000);
  const baseFlow = 85.2;
  const predicted_oil_flow = baseFlow * (1 + viscosityReduction * 0.8);
  const predicted_production = predicted_oil_flow * (0.92 + duration_hrs * 0.01);
  const predicted_temp = Math.min(380, 180 + heatInput * 120 + steam_temp * 0.15);
  const predicted_steam_consumption = steam_rate * duration_hrs * 0.85;

  return {
    predicted_temp: Math.round(predicted_temp * 10) / 10,
    predicted_oil_flow: Math.round(predicted_oil_flow * 10) / 10,
    predicted_production: Math.round(predicted_production * 10) / 10,
    predicted_steam_consumption: Math.round(predicted_steam_consumption),
  };
}

// SRP simulation: speed/stroke → pump performance → production/energy
export function runSRPSimulation(inputs: SRPInputs): SRPOutputs {
  const { srp_speed, stroke_length, pump_condition } = inputs;
  const conditionFactor =
    pump_condition === 'Good' ? 1.0 : pump_condition === 'Fair' ? 0.82 : 0.62;
  const baseProduction = 85.2;
  const speedFactor = srp_speed / 6.5;
  const strokeFactor = stroke_length / 120;
  const predicted_production =
    baseProduction * conditionFactor * Math.min(1.5, speedFactor * 0.7 + strokeFactor * 0.3);
  const predicted_pump_perf = Math.min(98, 72 + conditionFactor * 22 + speedFactor * 4);
  const predicted_energy = 42.5 * (0.6 + speedFactor * 0.5 + strokeFactor * 0.2);

  let predicted_problems = 'No issues detected.';
  if (pump_condition === 'Poor') {
    predicted_problems = 'Pump wear detected — recommend maintenance within 7 days. Possible valve leakage.';
  } else if (srp_speed > 9) {
    predicted_problems = 'High SPM may cause rod fatigue. Consider reducing speed to below 9 SPM.';
  } else if (srp_speed < 3) {
    predicted_problems = 'Low SPM — suboptimal pump fillage. Production below potential.';
  }

  return {
    predicted_production: Math.round(predicted_production * 10) / 10,
    predicted_pump_perf: Math.round(predicted_pump_perf * 10) / 10,
    predicted_energy: Math.round(predicted_energy * 10) / 10,
    predicted_problems,
  };
}

// Optimization: evaluate combinations and recommend best
export function runOptimization(
  objective: OptimizationResult['objective'],
  current: OptimizationResult['current'],
): OptimizationResult {
  const candidates: OptimizationResult['current'][] = [];
  const steamRates = [300, 350, 400, 450, 500, 550, 600];
  const steamTemps = [320, 340, 350, 360, 380];
  const pressures = [250, 300, 350, 400, 450];
  const srpSpeeds = [4, 5, 6, 6.5, 7, 8];
  const strokes = [90, 100, 110, 120, 130, 144];

  // Sample a subset for performance
  for (const sr of [300, 400, 450, 500, 550, 600]) {
    for (const st of [320, 340, 350, 360, 380]) {
      for (const p of [250, 300, 350, 400, 450]) {
        for (const sp of [4, 5, 6, 6.5, 7, 8]) {
          for (const sl of [90, 100, 120, 130, 144]) {
            candidates.push({
              steam_rate: sr, steam_temp: st, injection_pressure: p,
              srp_speed: sp, stroke_length: sl,
            });
          }
        }
      }
    }
  }

  let best = current;
  let bestScore = -Infinity;

  for (const c of candidates) {
    const css = runCSSSimulation({
      steam_rate: c.steam_rate, steam_temp: c.steam_temp,
      injection_pressure: c.injection_pressure, duration_hrs: 24,
    });
    const srp = runSRPSimulation({
      srp_speed: c.srp_speed, stroke_length: c.stroke_length, pump_condition: 'Good',
    });
    const production = (css.predicted_production + srp.predicted_production) / 2;
    const energy = srp.predicted_energy + c.steam_rate * 0.02;

    let score: number;
    if (objective === 'maximize_production') {
      score = production - energy * 0.1;
    } else if (objective === 'reduce_energy') {
      score = -energy + production * 0.3;
    } else {
      score = production / energy;
    }

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  const css = runCSSSimulation({
    steam_rate: best.steam_rate, steam_temp: best.steam_temp,
    injection_pressure: best.injection_pressure, duration_hrs: 24,
  });
  const srp = runSRPSimulation({
    srp_speed: best.srp_speed, stroke_length: best.stroke_length, pump_condition: 'Good',
  });
  const expected_production = Math.round(((css.predicted_production + srp.predicted_production) / 2) * 10) / 10;
  const expected_energy = Math.round((srp.predicted_energy + best.steam_rate * 0.02) * 10) / 10;

  const risks: string[] = [];
  if (best.steam_rate > 550) risks.push('High steam injection may cause thermal stress on casing.');
  if (best.srp_speed > 8) risks.push('Elevated SRP speed increases rod fatigue risk.');
  if (best.injection_pressure > 400) risks.push('High injection pressure may exceed formation fracture gradient.');
  if (risks.length === 0) risks.push('No significant risks detected at recommended settings.');

  const confidence = Math.round(72 + Math.random() * 18);

  return {
    objective,
    current,
    recommended: best,
    expected_production,
    expected_energy,
    detected_risks: risks,
    confidence,
  };
}

// Anomaly detection from readings
export function detectAnomalies(reading: typeof DEFAULT_WELL): { type: string; severity: Severity; description: string }[] {
  const anomalies: { type: string; severity: Severity; description: string }[] = [];

  if (reading.bottomhole_pressure_psi < 1300) {
    anomalies.push({
      type: 'pressure_drop',
      severity: reading.bottomhole_pressure_psi < 1200 ? 'critical' : 'warning',
      description: `Bottom-hole pressure at ${reading.bottomhole_pressure_psi} psi — below safe threshold of 1300 psi.`,
    });
  }
  if (reading.well_temperature_f > 260) {
    anomalies.push({
      type: 'high_temp',
      severity: reading.well_temperature_f > 300 ? 'critical' : 'warning',
      description: `Well temperature at ${reading.well_temperature_f}°F — exceeds normal operating range.`,
    });
  }
  if (reading.oil_production_bpd < 60) {
    anomalies.push({
      type: 'production_decline',
      severity: reading.oil_production_bpd < 50 ? 'critical' : 'warning',
      description: `Oil production at ${reading.oil_production_bpd} BPD — significant decline from baseline 85 BPD.`,
    });
  }
  if (reading.srp_speed_spm < 4.5 || reading.srp_speed_spm > 8.5) {
    anomalies.push({
      type: 'srp_anomaly',
      severity: 'warning',
      description: `SRP speed at ${reading.srp_speed_spm} SPM — outside optimal range (5-8 SPM).`,
    });
  }
  if (anomalies.length === 0) {
    anomalies.push({
      type: 'all_normal',
      severity: 'normal',
      description: 'All parameters within normal operating range.',
    });
  }
  return anomalies;
}

// Live data jitter — adds small random walk to simulate real-time sensor updates
export function jitterValue(base: number, range: number): number {
  const delta = (Math.random() - 0.5) * range;
  return Math.max(0, Math.round((base + delta) * 10) / 10);
}

export function statusFromReading(reading: typeof DEFAULT_WELL): WellStatus {
  if (reading.bottomhole_pressure_psi < 1200 || reading.oil_production_bpd < 50 || reading.well_temperature_f > 300) {
    return 'critical';
  }
  if (reading.bottomhole_pressure_psi < 1300 || reading.oil_production_bpd < 65 || reading.well_temperature_f > 250) {
    return 'warning';
  }
  return 'normal';
}
