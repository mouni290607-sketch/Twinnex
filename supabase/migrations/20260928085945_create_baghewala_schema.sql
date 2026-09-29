/*
# Baghewala Field Oil Well Schema

1. New Tables
- `well_readings` — real-time/simulated sensor data for Baghewala heavy oil wells.
  Columns: id, well_id, timestamp, oil_production_bpd, wellhead_pressure_psi,
  bottomhole_pressure_psi, well_temperature_f, oil_flow_rate_bpd, srp_speed_spm,
  steam_injection_rate_bpd, steam_temperature_f, energy_consumption_kw,
  status (normal/warning/critical), is_simulated.
- `css_simulations` — saved CSS simulation runs with inputs and predicted outputs.
  Columns: id, well_id, steam_rate, steam_temp, injection_pressure, duration_hrs,
  predicted_temp, predicted_oil_flow, predicted_production, predicted_steam_consumption,
  created_at.
- `srp_simulations` — saved SRP simulation runs.
  Columns: id, well_id, srp_speed, stroke_length, pump_condition,
  predicted_production, predicted_pump_perf, predicted_energy, predicted_problems,
  created_at.
- `optimization_results` — saved optimization recommendations.
  Columns: id, well_id, objective, current_settings (jsonb), recommended_settings (jsonb),
  expected_production, expected_energy, detected_risks (text[]), confidence,
  created_at.
- `anomaly_events` — detected anomalies.
  Columns: id, well_id, type, severity, description, created_at.
2. Security
- RLS enabled on all tables. Allow anon + authenticated CRUD (shared operational data).
3. Seed Data
- Insert initial well readings for Baghewala wells BW-01 through BW-06.
- Insert initial anomalies.
*/

CREATE TABLE IF NOT EXISTS well_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  well_id text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  oil_production_bpd double precision NOT NULL DEFAULT 0,
  wellhead_pressure_psi double precision NOT NULL DEFAULT 0,
  bottomhole_pressure_psi double precision NOT NULL DEFAULT 0,
  well_temperature_f double precision NOT NULL DEFAULT 0,
  oil_flow_rate_bpd double precision NOT NULL DEFAULT 0,
  srp_speed_spm double precision NOT NULL DEFAULT 0,
  steam_injection_rate_bpd double precision NOT NULL DEFAULT 0,
  steam_temperature_f double precision NOT NULL DEFAULT 0,
  energy_consumption_kw double precision NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'normal',
  is_simulated boolean NOT NULL DEFAULT true
);

ALTER TABLE well_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_readings" ON well_readings;
CREATE POLICY "anon_select_readings" ON well_readings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_readings" ON well_readings;
CREATE POLICY "anon_insert_readings" ON well_readings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_readings" ON well_readings;
CREATE POLICY "anon_update_readings" ON well_readings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_readings" ON well_readings;
CREATE POLICY "anon_delete_readings" ON well_readings FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS css_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  well_id text NOT NULL DEFAULT 'BW-01',
  steam_rate double precision NOT NULL,
  steam_temp double precision NOT NULL,
  injection_pressure double precision NOT NULL,
  duration_hrs double precision NOT NULL,
  predicted_temp double precision,
  predicted_oil_flow double precision,
  predicted_production double precision,
  predicted_steam_consumption double precision,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE css_simulations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_css" ON css_simulations;
CREATE POLICY "anon_select_css" ON css_simulations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_css" ON css_simulations;
CREATE POLICY "anon_insert_css" ON css_simulations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_css" ON css_simulations;
CREATE POLICY "anon_delete_css" ON css_simulations FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS srp_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  well_id text NOT NULL DEFAULT 'BW-01',
  srp_speed double precision NOT NULL,
  stroke_length double precision NOT NULL,
  pump_condition text NOT NULL DEFAULT 'Good',
  predicted_production double precision,
  predicted_pump_perf double precision,
  predicted_energy double precision,
  predicted_problems text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE srp_simulations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_srp" ON srp_simulations;
CREATE POLICY "anon_select_srp" ON srp_simulations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_srp" ON srp_simulations;
CREATE POLICY "anon_insert_srp" ON srp_simulations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_srp" ON srp_simulations;
CREATE POLICY "anon_delete_srp" ON srp_simulations FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS optimization_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  well_id text NOT NULL DEFAULT 'BW-01',
  objective text NOT NULL DEFAULT 'balance',
  current_settings jsonb NOT NULL DEFAULT '{}',
  recommended_settings jsonb NOT NULL DEFAULT '{}',
  expected_production double precision,
  expected_energy double precision,
  detected_risks text[] NOT NULL DEFAULT '{}',
  confidence double precision NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE optimization_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_opt" ON optimization_results;
CREATE POLICY "anon_select_opt" ON optimization_results FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_opt" ON optimization_results;
CREATE POLICY "anon_insert_opt" ON optimization_results FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_opt" ON optimization_results;
CREATE POLICY "anon_delete_opt" ON optimization_results FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS anomaly_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  well_id text NOT NULL,
  type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE anomaly_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_anom" ON anomaly_events;
CREATE POLICY "anon_select_anom" ON anomaly_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_anom" ON anomaly_events;
CREATE POLICY "anon_insert_anom" ON anomaly_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_anom" ON anomaly_events;
CREATE POLICY "anon_delete_anom" ON anomaly_events FOR DELETE TO anon, authenticated USING (true);

-- Seed well readings for Baghewala wells
INSERT INTO well_readings (well_id, oil_production_bpd, wellhead_pressure_psi, bottomhole_pressure_psi, well_temperature_f, oil_flow_rate_bpd, srp_speed_spm, steam_injection_rate_bpd, steam_temperature_f, energy_consumption_kw, status) VALUES
  ('BW-01', 85.2, 320, 1450, 210, 85.2, 6.5, 450, 350, 42.5, 'normal'),
  ('BW-02', 72.8, 295, 1380, 195, 72.8, 5.8, 420, 340, 38.2, 'normal'),
  ('BW-03', 64.5, 280, 1320, 188, 64.5, 5.2, 380, 335, 35.0, 'warning'),
  ('BW-04', 91.3, 340, 1520, 225, 91.3, 7.2, 500, 360, 48.8, 'normal'),
  ('BW-05', 58.1, 260, 1250, 180, 58.1, 4.8, 350, 330, 32.5, 'warning'),
  ('BW-06', 45.2, 240, 1180, 170, 45.2, 4.0, 300, 325, 28.0, 'critical')
ON CONFLICT DO NOTHING;

-- Seed anomalies
INSERT INTO anomaly_events (well_id, type, severity, description) VALUES
  ('BW-03', 'pressure_drop', 'warning', 'Bottom-hole pressure declining at 2.5 psi/hr — possible reservoir depletion in this zone.'),
  ('BW-05', 'production_decline', 'warning', 'Oil production dropped 12% over last 48 hours — CSS cycle may be needed.'),
  ('BW-06', 'pump_anomaly', 'critical', 'SRP pump efficiency at 68% — possible rod parting or valve wear detected.'),
  ('BW-01', 'temperature_normal', 'normal', 'All temperature readings within normal operating range.')
ON CONFLICT DO NOTHING;
