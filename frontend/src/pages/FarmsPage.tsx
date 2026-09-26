import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Droplets, Thermometer, Wind, CloudRain, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const mockFarms = [
  {
    id: 'f1',
    name: 'Farm Alpha',
    location: 'Sector 7, Greenfield Valley',
    status: 'Healthy',
    area: '120 acres',
    waterToday: '2400L',
    saved: '860L',
    zonesActive: 4,
    temp: '23.6°C',
    humidity: '77.1%',
    wind: '10.4 km/h',
    rain: '0.0 mm',
    zones: [
      { name: 'Zone North - Wheat', moisture: 42, status: 'active' },
      { name: 'Zone East - Corn', moisture: 28, status: 'warning' },
      { name: 'Zone South - Soybeans', moisture: 55, status: 'active' },
      { name: 'Zone West - Tomatoes', moisture: 18, status: 'critical' },
    ]
  },
  {
    id: 'f2',
    name: 'Farm Beta',
    location: 'Ridge Point, East County',
    status: 'Warning',
    area: '85 acres',
    waterToday: '1800L',
    saved: '520L',
    zonesActive: 3,
    temp: '22.8°C',
    humidity: '75.3%',
    wind: '13.5 km/h',
    rain: '0.0 mm',
    zones: [
      { name: 'Block A - Rice', moisture: 65, status: 'active' },
      { name: 'Block B - Peppers', moisture: 22, status: 'warning' },
      { name: 'Block C - Lettuce', moisture: 48, status: 'active' },
    ]
  }
];

const FarmCard = ({ farm }) => {
  const [expanded, setExpanded] = useState(false);
  const isHealthy = farm.status === 'Healthy';

  return (
    <motion.div 
      layout
      className="glass-card overflow-hidden mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">{farm.name}</h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-lighter border border-white/5">
                <div className={isHealthy ? "glow-dot" : "glow-warning"} />
                <span className="text-xs font-medium text-gray-300">{farm.status}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {farm.location}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-surface-light border border-white/5 text-gray-300 font-medium text-sm hover:bg-surface-lighter transition-colors">
              Crop Setup
            </button>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-light font-medium text-sm hover:bg-brand-primary/20 transition-colors"
            >
              {expanded ? 'Collapse' : 'Details'} 
              <motion.div animate={{ rotate: expanded ? 90 : 0 }}><ChevronRight className="w-4 h-4" /></motion.div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Area', value: farm.area },
            { label: 'Water Today', value: farm.waterToday },
            { label: 'Saved', value: farm.saved, color: 'text-brand-light' },
            { label: 'Zones', value: `${farm.zonesActive} active` },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-lg bg-surface/40 border border-white/5">
              <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
              <p className={clsx("text-lg font-bold", stat.color || "text-gray-200")}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Temp', value: farm.temp, icon: Thermometer },
            { label: 'Humidity', value: farm.humidity, icon: Droplets },
            { label: 'Wind', value: farm.wind, icon: Wind },
            { label: 'Rain', value: farm.rain, icon: CloudRain },
          ].map((metric, i) => (
            <div key={i} className="flex items-center gap-3">
              <metric.icon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">{metric.label}</p>
                <p className="text-sm font-medium text-gray-300">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {farm.zones.map((zone, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{zone.name}</span>
                <div className="flex items-center gap-3">
                  {zone.status === 'active' && <span className="text-xs text-brand-light font-medium flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse"/> Active</span>}
                  <span className="font-medium text-white">{zone.moisture}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-surface-lighter rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${zone.moisture}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={clsx(
                    "h-full rounded-full",
                    zone.status === 'critical' ? "bg-red-500" :
                    zone.status === 'warning' ? "bg-yellow-500" : "bg-brand-primary"
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pt-6 mt-6 border-t border-white/5"
            >
              <div className="h-48 w-full flex items-center justify-center bg-surface/30 rounded-lg border border-white/5">
                <p className="text-gray-500 text-sm">Interactive charts and advanced ML zone control loading...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const FarmsPage = () => {
  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Your Farms</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-surface-light border border-white/5 text-sm text-gray-300 font-medium hover:text-white hover:bg-surface-lighter transition-colors">
            + Add Field
          </button>
          <div className="px-4 py-2 rounded-full bg-surface-light border border-white/5 text-sm text-gray-400 font-medium">
            2 farms • 7 zones total
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {mockFarms.map(farm => (
          <FarmCard key={farm.id} farm={farm} />
        ))}
      </div>
    </div>
  );
};

export default FarmsPage;
