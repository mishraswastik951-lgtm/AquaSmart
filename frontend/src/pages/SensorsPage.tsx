import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Thermometer, Wind, CloudRain, Sun, Activity, Info } from 'lucide-react';
import clsx from 'clsx';

const mockSensors = [
  { id: 's1', label: 'Soil Moisture', value: '39.8%', optimal: '30-60%', icon: Droplets, status: 'Healthy' },
  { id: 's2', label: 'Temperature', value: '23.6°C', optimal: '18-32°C', icon: Thermometer, status: 'Healthy' },
  { id: 's3', label: 'Humidity', value: '77.1%', optimal: '40-70%', icon: CloudRain, status: 'Healthy' },
  { id: 's4', label: 'Light Intensity', value: '149 lux', optimal: 'Varies by crop', icon: Sun, status: 'Healthy' },
  { id: 's5', label: 'Wind Speed', value: '10.4 km/h', optimal: '<15 km/h', icon: Wind, status: 'Healthy' },
  { id: 's6', label: 'Rainfall', value: '0.0 mm', optimal: 'Current hour', icon: Activity, status: 'Healthy' },
];

const SensorCard = ({ sensor, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card-hover p-6 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-surface/50 border border-white/5">
          <sensor.icon className="w-5 h-5 text-gray-400 group-hover:text-brand-light transition-colors" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="glow-dot" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{sensor.status}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-400 mb-1">{sensor.label}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{sensor.value}</p>
        <p className="text-xs text-gray-500 mt-1">Optimal: {sensor.optimal}</p>
      </div>

      <div className="flex gap-1 h-3 items-end">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-full rounded-t-sm bg-surface-lighter transition-all duration-300 group-hover:bg-brand-primary/40"
            style={{ height: `${Math.max(10, Math.random() * 100)}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const SensorsPage = () => {
  const [activeFarm, setActiveFarm] = useState('Farm Alpha');

  return (
    <div className="max-w-6xl animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-brand-primary" />
          <h1 className="text-3xl font-extrabold text-white">Sensor Monitoring</h1>
        </div>
        <div className="flex gap-2">
          {['Farm Alpha', 'Farm Beta'].map(farm => (
            <button
              key={farm}
              onClick={() => setActiveFarm(farm)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeFarm === farm 
                  ? "bg-brand-primary/20 text-brand-light border border-brand-primary/30" 
                  : "bg-surface-light border border-white/5 text-gray-400 hover:text-white"
              )}
            >
              {farm}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mockSensors.map((sensor, i) => (
          <SensorCard key={sensor.id} sensor={sensor} index={i} />
        ))}
      </div>

      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" /> Historical Readings
        </h2>
        <div className="h-64 w-full flex items-center justify-center bg-surface/30 rounded-lg border border-white/5">
           <p className="text-gray-500 text-sm flex items-center gap-2"><Info className="w-4 h-4"/> Multi-series area chart loading...</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Readings Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-surface/30 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Moisture</th>
                <th className="px-4 py-3 font-medium">Temp</th>
                <th className="px-4 py-3 font-medium">Humidity</th>
                <th className="px-4 py-3 font-medium">Light</th>
                <th className="px-4 py-3 font-medium">Wind</th>
                <th className="px-4 py-3 font-medium">Rain</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '10:09:12 AM', m: '39.8%', t: '23.6°C', h: '77.1%', l: '149', w: '10.4', r: '0.0' },
                { time: '9:09:12 AM', m: '41.5%', t: '24.6°C', h: '76.1%', l: '146', w: '9.4', r: '0.0' },
                { time: '8:09:12 AM', m: '44.6%', t: '26.2°C', h: '76.6%', l: '162', w: '13.0', r: '0.0' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors text-gray-300">
                  <td className="px-4 py-3">{row.time}</td>
                  <td className="px-4 py-3 font-medium">{row.m}</td>
                  <td className="px-4 py-3">{row.t}</td>
                  <td className="px-4 py-3">{row.h}</td>
                  <td className="px-4 py-3">{row.l}</td>
                  <td className="px-4 py-3">{row.w}</td>
                  <td className="px-4 py-3">{row.r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SensorsPage;
