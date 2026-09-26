import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Filter, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

const mockAlerts = [
  { id: 1, type: 'critical', msg: 'Zone West soil moisture critically low (18%)', time: '10:04:12 AM', ack: false },
  { id: 2, type: 'warning', msg: 'Zone East approaching moisture threshold', time: '9:54:12 AM', ack: false },
  { id: 3, type: 'info', msg: 'Block A irrigation cycle completed', time: '9:30:12 AM', ack: true },
  { id: 4, type: 'warning', msg: 'Wind speed above optimal for sprinkler irrigation', time: '8:44:12 AM', ack: true },
  { id: 5, type: 'info', msg: 'ML model updated with latest sensor data', time: '8:00:12 AM', ack: false },
];

const AlertsPage = () => {
  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-brand-primary" />
          <h1 className="text-3xl font-extrabold text-white">Alerts Center</h1>
        </div>
        <div className="flex gap-2">
          {['All', 'Critical', 'Warning', 'Info'].map(filter => (
            <button key={filter} className="px-4 py-1.5 rounded-full text-xs font-medium bg-surface/50 border border-white/5 text-gray-400 hover:text-white transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="p-3 rounded-lg bg-red-500/10"><AlertOctagon className="w-6 h-6 text-red-500" /></div>
          <div><p className="text-sm text-gray-400">Critical</p><p className="text-2xl font-bold text-white">1</p></div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-yellow-500">
          <div className="p-3 rounded-lg bg-yellow-500/10"><AlertTriangle className="w-6 h-6 text-yellow-500" /></div>
          <div><p className="text-sm text-gray-400">Warnings</p><p className="text-2xl font-bold text-white">2</p></div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-brand-primary">
          <div className="p-3 rounded-lg bg-brand-primary/10"><CheckCircle2 className="w-6 h-6 text-brand-primary" /></div>
          <div><p className="text-sm text-gray-400">Acknowledged</p><p className="text-2xl font-bold text-white">2</p></div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Live Alerts Feed</h2>
        <div className="space-y-3">
          {mockAlerts.map((alert, i) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                alert.ack ? 'bg-surface/30 border-white/5 opacity-50' : 
                alert.type === 'critical' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/50' :
                alert.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/50' :
                'bg-surface-light/40 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex gap-4 items-center">
                {alert.type === 'critical' && <div className="glow-critical" />}
                {alert.type === 'warning' && <div className="glow-warning" />}
                {alert.type === 'info' && <div className="w-2 h-2 rounded-full border border-gray-500" />}
                <div>
                  <p className={`font-medium text-sm mb-1 ${
                    alert.type === 'critical' ? 'text-red-400' :
                    alert.type === 'warning' ? 'text-yellow-500' : 'text-gray-300'
                  }`}>{alert.msg}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
              <CheckCircle2 className={`w-5 h-5 ${alert.ack ? 'text-brand-primary' : 'text-gray-600 hover:text-white transition-colors'}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
