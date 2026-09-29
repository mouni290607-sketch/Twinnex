/*
# Create TWINNEX workflow schema

1. New Tables
- `workflow_steps` — top-level workflow steps shown on the main page. Columns: id, title, description, icon, order, created_at.
- `step_data` — data rows belonging to a step (current state, changes, simulation outcome). Columns: id, step_id, label, current_state, changes, simulation_result, created_at.
- `alerts` — system alerts shown in the top-right alerts panel. Columns: id, title, message, severity (info/warning/error/success), created_at.
2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD (shared workflow data, no per-user isolation needed).
3. Notes
- Data is intentionally shared/public — all signed-in users see the same workflow data.
- Seed data is inserted so the app displays real content immediately.
*/

CREATE TABLE IF NOT EXISTS workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Workflow',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_steps" ON workflow_steps;
CREATE POLICY "anon_select_steps" ON workflow_steps FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_steps" ON workflow_steps;
CREATE POLICY "anon_insert_steps" ON workflow_steps FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_steps" ON workflow_steps;
CREATE POLICY "anon_update_steps" ON workflow_steps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_steps" ON workflow_steps;
CREATE POLICY "anon_delete_steps" ON workflow_steps FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS step_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  label text NOT NULL,
  current_state text NOT NULL,
  changes text NOT NULL,
  simulation_result text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE step_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_step_data" ON step_data;
CREATE POLICY "anon_select_step_data" ON step_data FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_step_data" ON step_data;
CREATE POLICY "anon_insert_step_data" ON step_data FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_step_data" ON step_data;
CREATE POLICY "anon_update_step_data" ON step_data FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_step_data" ON step_data;
CREATE POLICY "anon_delete_step_data" ON step_data FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alerts" ON alerts;
CREATE POLICY "anon_select_alerts" ON alerts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alerts" ON alerts;
CREATE POLICY "anon_insert_alerts" ON alerts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alerts" ON alerts;
CREATE POLICY "anon_update_alerts" ON alerts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alerts" ON alerts;
CREATE POLICY "anon_delete_alerts" ON alerts FOR DELETE
  TO anon, authenticated USING (true);

-- Seed workflow steps
INSERT INTO workflow_steps (title, description, icon, "order") VALUES
  ('Data Ingestion', 'Collect and validate raw data from multiple sources in real time.', 'Database', 1),
  ('Preprocessing', 'Clean, normalize, and transform data for analysis.', 'Filter', 2),
  ('Model Training', 'Train machine learning models on the processed dataset.', 'BrainCircuit', 3),
  ('Simulation', 'Run predictive simulations and analyze outcomes.', 'Play', 4),
  ('Deployment', 'Deploy the trained model to production environments.', 'Rocket', 5),
  ('Monitoring', 'Continuously monitor model performance and drift.', 'Activity', 6)
ON CONFLICT DO NOTHING;

-- Seed step_data for each step
INSERT INTO step_data (step_id, label, current_state, changes, simulation_result)
SELECT id, 'Pipeline Status', 'Active — 1.2M records processed', 'Throughput increased by 15%', 'No anomalies detected in last 24h'
FROM workflow_steps WHERE title = 'Data Ingestion'
ON CONFLICT DO NOTHING;

INSERT INTO step_data (step_id, label, current_state, changes, simulation_result)
SELECT id, 'Cleanliness Score', '98.7% data quality index', 'Removed 3,400 duplicate entries', 'Quality stable above 95% threshold'
FROM workflow_steps WHERE title = 'Preprocessing'
ON CONFLICT DO NOTHING;

INSERT INTO step_data (step_id, label, current_state, changes, simulation_result)
SELECT id, 'Model Accuracy', '94.3% validation accuracy', 'Retrained on 50K new samples', 'Expected accuracy: 95.1% ± 0.4%'
FROM workflow_steps WHERE title = 'Model Training'
ON CONFLICT DO NOTHING;

INSERT INTO step_data (step_id, label, current_state, changes, simulation_result)
SELECT id, 'Simulation Run', '12 scenarios completed', 'Added 3 edge-case scenarios', 'Best-case outcome: 97.2% success rate'
FROM workflow_steps WHERE title = 'Simulation'
ON CONFLICT DO NOTHING;

INSERT INTO step_data (step_id, label, current_state, changes, simulation_result)
SELECT id, 'Deployment Status', 'Deployed to staging — v2.4.1', 'Canary release at 20% traffic', 'Zero errors in canary group'
FROM workflow_steps WHERE title = 'Deployment'
ON CONFLICT DO NOTHING;

INSERT INTO step_data (step_id, label, current_state, changes, simulation_result)
SELECT id, 'Health Check', 'All systems operational', 'Latency reduced by 8ms', 'Predicted uptime: 99.97% over next 7 days'
FROM workflow_steps WHERE title = 'Monitoring'
ON CONFLICT DO NOTHING;

-- Seed alerts
INSERT INTO alerts (title, message, severity) VALUES
  ('High Throughput Detected', 'Data ingestion pipeline is processing 1.2M records/min — above normal threshold.', 'info'),
  ('Model Drift Warning', 'Model accuracy has dropped 0.3% in the last 6 hours. Consider retraining.', 'warning'),
  ('Deployment Successful', 'Canary release v2.4.1 deployed with zero errors.', 'success'),
  ('Disk Usage Alert', 'Storage utilization at 82% on the simulation cluster.', 'warning')
ON CONFLICT DO NOTHING;
