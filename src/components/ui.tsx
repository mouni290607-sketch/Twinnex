import { ReactNode } from 'react';
import type { WellStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: WellStatus }) {
  const config = {
    normal: { color: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400', dot: 'bg-green-500', label: 'Normal' },
    warning: { color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Warning' },
    critical: { color: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Critical' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.color}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot} ${status !== 'normal' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function MetricCard({
  label, value, unit, icon, color = 'text-cyan-500', sublabel,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  color?: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
        {icon && <span className={color}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>}
      </p>
      {sublabel && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sublabel}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function SimulatedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
      Simulated Real-Time Data
    </span>
  );
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-950/40 px-2.5 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      LIVE
    </span>
  );
}

export function InputField({
  label, value, onChange, unit, min, max, step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-slate-800 dark:text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}

export function Button({
  children, onClick, variant = 'primary', disabled, className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-700',
    secondary: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
    ghost: 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
