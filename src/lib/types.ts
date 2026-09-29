export type WellStatus = 'normal' | 'warning' | 'critical';
export type Severity = 'normal' | 'warning' | 'critical';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  created_at: string;
}

export interface StepData {
  id: string;
  step_id: string;
  label: string;
  current_state: string;
  changes: string;
  simulation_result: string;
  created_at: string;
}

export interface WellReading {
  id: string;
  well_id: string;
  timestamp: string;
  oil_production_bpd: number;
  wellhead_pressure_psi: number;
  bottomhole_pressure_psi: number;
  well_temperature_f: number;
  oil_flow_rate_bpd: number;
  srp_speed_spm: number;
  steam_injection_rate_bpd: number;
  steam_temperature_f: number;
  energy_consumption_kw: number;
  status: WellStatus;
  is_simulated: boolean;
}

export interface CSSInputs {
  steam_rate: number;
  steam_temp: number;
  injection_pressure: number;
  duration_hrs: number;
}

export interface CSSOutputs {
  predicted_temp: number;
  predicted_oil_flow: number;
  predicted_production: number;
  predicted_steam_consumption: number;
}

export interface SRPInputs {
  srp_speed: number;
  stroke_length: number;
  pump_condition: string;
}

export interface SRPOutputs {
  predicted_production: number;
  predicted_pump_perf: number;
  predicted_energy: number;
  predicted_problems: string;
}

export interface OptimizationResult {
  objective: 'maximize_production' | 'reduce_energy' | 'balance';
  current: {
    steam_rate: number;
    steam_temp: number;
    injection_pressure: number;
    srp_speed: number;
    stroke_length: number;
  };
  recommended: {
    steam_rate: number;
    steam_temp: number;
    injection_pressure: number;
    srp_speed: number;
    stroke_length: number;
  };
  expected_production: number;
  expected_energy: number;
  detected_risks: string[];
  confidence: number;
}

export interface AnomalyEvent {
  id: string;
  well_id: string;
  type: string;
  severity: Severity;
  description: string;
  created_at: string;
}

export type PageKey =
  | 'dashboard'
  | 'monitoring'
  | 'css'
  | 'srp'
  | 'digital-twin'
  | 'prediction'
  | 'anomalies'
  | 'optimization'
  | 'reports';
