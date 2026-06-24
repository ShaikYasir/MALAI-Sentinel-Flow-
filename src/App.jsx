import { useState } from 'react';
import Dashboard      from './pages/Dashboard';
import TurbinesPage   from './pages/TurbinesPage';
import AlarmCenterPage from './pages/AlarmCenterPage';
import MaintenancePage from './pages/MaintenancePage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  const [currentPage, setCurrentPage]           = useState('dashboard');
  const [selectedTurbineId, setSelectedTurbineId] = useState(null);

  // Navigate to Turbines page and pre-select a turbine
  const navigateToTurbine = (turbineId) => {
    setSelectedTurbineId(turbineId);
    setCurrentPage('turbines');
  };

  if (currentPage === 'turbines') {
    return (
      <TurbinesPage
        activePage={currentPage}
        onNavigate={setCurrentPage}
        initialTurbineId={selectedTurbineId}
        onNavigateAlarms={() => setCurrentPage('alarms')}
      />
    );
  }
  if (currentPage === 'alarms') {
    return (
      <AlarmCenterPage
        activePage={currentPage}
        onNavigate={setCurrentPage}
        onNavigateTurbine={navigateToTurbine}
      />
    );
  }
  if (currentPage === 'maintenance') {
    return (
      <MaintenancePage
        activePage={currentPage}
        onNavigate={setCurrentPage}
        onNavigateTurbine={navigateToTurbine}
      />
    );
  }
  if (currentPage === 'analytics') {
    return (
      <AnalyticsPage
        activePage={currentPage}
        onNavigate={setCurrentPage}
      />
    );
  }
  if (currentPage === 'reports') {
    return (
      <ReportsPage
        activePage={currentPage}
        onNavigate={setCurrentPage}
      />
    );
  }
  return (
    <Dashboard
      activePage={currentPage}
      onNavigate={setCurrentPage}
      onNavigateTurbine={navigateToTurbine}
    />
  );
}
