import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { motion } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import FarmsPage from './pages/FarmsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import SensorsPage from './pages/SensorsPage';
import MLModelsPage from './pages/MLModelsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-bg text-gray-100 font-sans selection:bg-brand-primary/30 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-brand-dark/30 blur-[120px]"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-brand-primary/20 blur-[150px]"
          />
        </div>

        <div className="z-10 relative flex w-full">
          <Sidebar />
          <main className="flex-1 h-screen overflow-y-auto z-10 relative">
          <div className="p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/farms" element={<FarmsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/sensors" element={<SensorsPage />} />
              <Route path="/models" element={<MLModelsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
