import { useState, useEffect, useRef } from 'react';
import { DEFAULT_WELL, jitterValue, statusFromReading } from './simulation';
import type { WellStatus } from './types';

export interface LiveReading {
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
}

export interface LivePoint {
  time: string;
  temperature: number;
  pressure: number;
  oil_production: number;
  steam_injection: number;
  srp_performance: number;
  energy: number;
}

function generatePoint(prev: LiveReading): LivePoint {
  return {
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    temperature: prev.well_temperature_f,
    pressure: prev.wellhead_pressure_psi,
    oil_production: prev.oil_production_bpd,
    steam_injection: prev.steam_injection_rate_bpd,
    srp_performance: prev.srp_speed_spm * 10,
    energy: prev.energy_consumption_kw,
  };
}

export function useLiveData() {
  const [reading, setReading] = useState<LiveReading>({
    ...DEFAULT_WELL,
    status: statusFromReading(DEFAULT_WELL),
  });
  const [history, setHistory] = useState<LivePoint[]>(() => {
    const initial: LivePoint[] = [];
    for (let i = 20; i >= 1; i--) {
      initial.push({
        time: `T-${i}`,
        temperature: jitterValue(DEFAULT_WELL.well_temperature_f, 8),
        pressure: jitterValue(DEFAULT_WELL.wellhead_pressure_psi, 12),
        oil_production: jitterValue(DEFAULT_WELL.oil_production_bpd, 6),
        steam_injection: jitterValue(DEFAULT_WELL.steam_injection_rate_bpd, 15),
        srp_performance: jitterValue(DEFAULT_WELL.srp_speed_spm * 10, 4),
        energy: jitterValue(DEFAULT_WELL.energy_consumption_kw, 3),
      });
    }
    return initial;
  });
  const baseRef = useRef(DEFAULT_WELL);

  useEffect(() => {
    const interval = setInterval(() => {
      baseRef.current = {
        oil_production_bpd: jitterValue(baseRef.current.oil_production_bpd, 4),
        wellhead_pressure_psi: jitterValue(baseRef.current.wellhead_pressure_psi, 8),
        bottomhole_pressure_psi: jitterValue(baseRef.current.bottomhole_pressure_psi, 6),
        well_temperature_f: jitterValue(baseRef.current.well_temperature_f, 5),
        oil_flow_rate_bpd: jitterValue(baseRef.current.oil_flow_rate_bpd, 4),
        srp_speed_spm: jitterValue(baseRef.current.srp_speed_spm, 0.3),
        steam_injection_rate_bpd: jitterValue(baseRef.current.steam_injection_rate_bpd, 10),
        steam_temperature_f: jitterValue(baseRef.current.steam_temperature_f, 4),
        energy_consumption_kw: jitterValue(baseRef.current.energy_consumption_kw, 2),
      } as typeof DEFAULT_WELL;

      const newReading: LiveReading = {
        ...baseRef.current,
        status: statusFromReading(baseRef.current),
      };
      setReading(newReading);
      setHistory((prev) => {
        const point = generatePoint(newReading);
        const next = [...prev, point];
        return next.slice(-30);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { reading, history };
}
