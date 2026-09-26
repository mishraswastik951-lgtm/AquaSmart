import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Activity, CloudRain, Thermometer, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { time: '08:00', moisture: 42 },
  { time: '10:00', moisture: 38 },
  { time: '12:00', moisture: 35 },
  { time: '14:00', moisture: 55 },
  { time: '16:00', moisture: 51 },
  { time: '18:00', moisture: 48 },
  { time: '20:00', moisture: 45 },
];

const StatCard = ({ title, value, icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card p-6 relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="w-16 h-16 text-brand-primary" />
    </div>
    <div className="relative z-10">
      <h3 className="text-gray-400 text-sm font-medium tracking-wide uppercase mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back. System is running optimally.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Water Used Today" value="2,400L" icon={Droplet} delay={0.1} />
        <StatCard title="Active Zones" value="4/7" icon={Activity} delay={0.2} />
        <StatCard title="Avg Temperature" value="24.2°C" icon={Thermometer} delay={0.3} />
        <StatCard title="ML Predictions" value="Optimal" icon={CloudRain} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div 
          className="lg:col-span-2 glass-card p-6 min-h-[400px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Soil Moisture Trend</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-surface-lighter text-xs font-medium text-brand-light cursor-pointer">Farm Alpha</span>
              <span className="px-3 py-1 rounded-full bg-surface/50 text-xs font-medium text-gray-400 cursor-pointer hover:text-white transition">Farm Beta</span>
            </div>
          </div>
          <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#4ade80' }}
                />
                <Area type="monotone" dataKey="moisture" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorMoisture)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Live Alerts</h2>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-surface/50 border border-white/5 hover:border-brand-primary/30 transition-colors cursor-pointer flex gap-4">
                <div className="mt-1 glow-warning shrink-0" />
                <div>
                  <p className="text-sm text-yellow-500 font-medium mb-1">Zone East moisture approaching threshold</p>
                  <p className="text-xs text-gray-500">10:04 AM</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
