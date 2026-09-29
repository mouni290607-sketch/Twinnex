import { useState, useEffect } from 'react';
import type { PageKey } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import AlertsPanel from '@/components/AlertsPanel';
import AIAssistant from '@/components/AIAssistant';
import DashboardPage from '@/pages/DashboardPage';
import MonitoringPage from '@/pages/MonitoringPage';
import CSSPage from '@/pages/CSSPage';
import SRPPage from '@/pages/SRPPage';
import DigitalTwinPage from '@/pages/DigitalTwinPage';
import PredictionPage from '@/pages/PredictionPage';
import AnomaliesPage from '@/pages/AnomaliesPage';
import OptimizationPage from '@/pages/OptimizationPage';
import ReportsPage from '@/pages/ReportsPage';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase
      .from('anomaly_events')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => setAlertCount(count ?? 0));

    const channel = supabase
      .channel('anomaly_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomaly_events' }, () => {
        supabase
          .from('anomaly_events')
          .select('*', { count: 'exact', head: true })
          .then(({ count }) => setAlertCount(count ?? 0));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={setActivePage} />;
      case 'monitoring': return <MonitoringPage />;
      case 'css': return <CSSPage />;
      case 'srp': return <SRPPage />;
      case 'digital-twin': return <DigitalTwinPage />;
      case 'prediction': return <PredictionPage />;
      case 'anomalies': return <AnomaliesPage />;
      case 'optimization': return <OptimizationPage />;
      case 'reports': return <ReportsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopBar
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onToggleAlerts={() => setAlertsOpen((v) => !v)}
        alertCount={alertCount}
        onSearch={handleSearch}
      />

      <Sidebar
        activePage={activePage}
        onSelect={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />

      <main className="px-4 py-6 sm:px-6 md:ml-64">
        <div className="mx-auto max-w-6xl">
          {renderPage()}
        </div>
      </main>

      <AIAssistant query={searchQuery} onQueryConsumed={() => setSearchQuery('')} />
      
    </div>
  );
}
