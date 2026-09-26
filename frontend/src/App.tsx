import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import FarmsPage from './pages/FarmsPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight">💧 AquaSmart</Link>
            <div className="space-x-6 flex items-center text-sm font-medium">
              <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
              <Link to="/farms" className="hover:text-blue-200 transition">Farms</Link>
              <Link to="/alerts" className="hover:text-blue-200 transition flex items-center">
                Alerts <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">2</span>
              </Link>
              <Link to="/reports" className="hover:text-blue-200 transition">AI Reports</Link>
              <Link to="/settings" className="hover:text-blue-200 transition">Settings</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/farms" element={<FarmsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Add more routes here */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
