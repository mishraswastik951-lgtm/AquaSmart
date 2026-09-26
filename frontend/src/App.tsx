import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import FarmsPage from './pages/FarmsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import SensorsPage from './pages/SensorsPage';
import MLModelsPage from './pages/MLModelsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-bg text-gray-100 font-sans selection:bg-brand-primary/30">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto">
          <div className="p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/farms" element={<FarmsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/sensors" element={<SensorsPage />} />
              <Route path="/models" element={<MLModelsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
