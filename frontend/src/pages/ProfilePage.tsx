import React from 'react';
import { User, Mail, Phone, MapPin, Building, ShieldCheck, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  return (
    <div className="max-w-4xl animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <User className="w-8 h-8 text-brand-primary" />
          Farm Administrator Profile
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-light rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-colors">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 flex flex-col items-center text-center"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-dark to-brand-primary p-1 mb-4 shadow-lg shadow-brand-primary/20">
              <div className="w-full h-full rounded-full bg-surface-light flex items-center justify-center overflow-hidden border-4 border-bg">
                <User className="w-16 h-16 text-gray-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Jane Doe</h2>
            <p className="text-brand-light font-medium text-sm mb-4">Lead Agronomist</p>
            <div className="flex items-center gap-2 text-xs font-medium bg-surface/50 px-3 py-1.5 rounded-full border border-white/5">
              <ShieldCheck className="w-4 h-4 text-brand-primary" /> Super Admin
            </div>
          </motion.div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h3>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Mail className="w-4 h-4 text-gray-500" /> jane.doe@farmlytics.com
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Phone className="w-4 h-4 text-gray-500" /> +1 (555) 987-6543
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <MapPin className="w-4 h-4 text-gray-500" /> Greenfield Valley, CA
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Building className="w-4 h-4 text-gray-500" /> AquaSmart Corp
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[
                { action: "Adjusted Zone East irrigation schedule", time: "2 hours ago", color: "bg-blue-500" },
                { action: "Acknowledged Critical Moisture Alert", time: "5 hours ago", color: "bg-brand-primary" },
                { action: "Added new field 'Block D' to Farm Beta", time: "1 day ago", color: "bg-purple-500" },
                { action: "Updated Random Forest ML Model", time: "2 days ago", color: "bg-yellow-500" }
              ].map((log, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 3 && <div className="absolute left-1.5 top-6 bottom-[-24px] w-[1px] bg-white/5" />}
                  <div className={`w-3 h-3 mt-1.5 rounded-full ${log.color} shadow-[0_0_8px_rgba(255,255,255,0.2)] z-10 shrink-0`} />
                  <div>
                    <p className="text-sm text-gray-300 font-medium mb-0.5">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Account Security</h3>
            <div className="p-4 rounded-lg bg-surface/50 border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-white mb-1">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Currently enabled via Authenticator App</p>
              </div>
              <button className="px-4 py-2 bg-surface-lighter rounded-md text-xs font-medium hover:bg-white/10 transition-colors">Manage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
