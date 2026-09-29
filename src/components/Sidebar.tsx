import type { PageKey } from '@/lib/types';
import {
  LayoutDashboard, Activity, Flame, Wrench, Box, Brain,
  AlertTriangle, TrendingUp, FileText, X,
} from 'lucide-react';
import { ComponentType } from 'react';

interface NavItem {
  key: PageKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'monitoring', label: 'Well Monitoring', icon: Activity },
  { key: 'css', label: 'CSS', icon: Flame },
  { key: 'srp', label: 'SRP', icon: Wrench },
  { key: 'digital-twin', label: 'Digital Twin', icon: Box },
  { key: 'prediction', label: 'Prediction', icon: Brain },
  { key: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  { key: 'optimization', label: 'Optimization', icon: TrendingUp },
  { key: 'reports', label: 'Reports', icon: FileText },
];

interface SidebarProps {
  activePage: PageKey;
  onSelect: (page: PageKey) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ activePage, onSelect, open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 px-3 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === activePage;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelect(item.key);
                  onClose();
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/10 to-teal-500/10 text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                    active
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-5 py-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
            <p className="text-[10px] font-medium text-slate-400">BAGHEWALA FIELD</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Heavy Oil · CSS &amp; SRP</p>
          </div>
        </div>
      </aside>
    </>
  );
}
