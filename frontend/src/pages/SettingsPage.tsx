import React, { useState } from 'react';
import { Settings, Droplets, Bell, Brain, Database, ShieldCheck, Wifi, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

const Toggle = ({ active }) => (
  <div className={clsx("w-10 h-5 rounded-full flex items-center px-0.5 transition-colors duration-300", active ? "bg-brand-primary" : "bg-surface-lighter")}>
    <div className={clsx("w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300", active ? "translate-x-5" : "translate-x-0")} />
  </div>
);

const SettingsGroup = ({ title, icon: Icon, children }) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-surface/50 rounded-lg border border-white/5">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const SettingsPage = () => {
  return (
    <div className="max-w-5xl animate-in fade-in duration-500 pb-12">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-brand-primary" />
          <h1 className="text-3xl font-extrabold text-white">Settings</h1>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-lg font-medium text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 border border-white/5 bg-surface/50">
            <RotateCcw className="w-4 h-4"/> Reset
          </button>
          <button className="px-6 py-2 rounded-lg font-medium text-sm text-bg bg-brand-primary hover:bg-brand-light transition-colors shadow-lg shadow-brand-primary/20">
            Save Changes
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SettingsGroup title="Irrigation Settings" icon={Droplets}>
          <div className="flex justify-between items-center cursor-pointer group">
            <div><p className="text-sm font-medium text-white mb-1">Auto Irrigation</p><p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Enable ML-driven automatic irrigation scheduling</p></div>
            <Toggle active={true} />
          </div>
          <div className="flex justify-between items-center cursor-pointer group">
            <div><p className="text-sm font-medium text-white mb-1">Night Irrigation Only</p><p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Restrict irrigation to nighttime to reduce evaporation</p></div>
            <Toggle active={false} />
          </div>
        </SettingsGroup>

        <SettingsGroup title="Notification Preferences" icon={Bell}>
          <div className="flex justify-between items-center cursor-pointer group">
            <div><p className="text-sm font-medium text-white mb-1">Email Alerts</p><p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Receive critical alerts via email</p></div>
            <Toggle active={true} />
          </div>
          <div className="flex justify-between items-center cursor-pointer group">
            <div><p className="text-sm font-medium text-white mb-1">Push Notifications</p><p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Get real-time push notifications on mobile</p></div>
            <Toggle active={false} />
          </div>
        </SettingsGroup>

        <SettingsGroup title="ML & Decision Engine" icon={Brain}>
          <div className="flex justify-between items-center cursor-pointer group">
            <div><p className="text-sm font-medium text-white mb-1">Fault Tolerance Mode</p><p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Auto-fallback to rule-based engine on ML failure</p></div>
            <Toggle active={true} />
          </div>
        </SettingsGroup>

        <SettingsGroup title="Data Management" icon={Database}>
          <div className="flex justify-between items-center cursor-pointer group">
            <div><p className="text-sm font-medium text-white mb-1">Extended Data Logging</p><p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Store raw sensor data for 90 days instead of 30</p></div>
            <Toggle active={false} />
          </div>
        </SettingsGroup>
      </div>

      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-8 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-gray-400"/> Alert Thresholds</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div><p className="text-sm text-gray-400 mb-4 flex justify-between">Moisture Low <span className="text-white font-bold">20%</span></p><div className="h-1 bg-surface-lighter rounded-full relative"><div className="absolute w-4 h-4 bg-brand-light rounded-full -top-1.5 left-[20%] shadow-lg shadow-brand-primary/50" /></div></div>
          <div><p className="text-sm text-gray-400 mb-4 flex justify-between">Moisture High <span className="text-white font-bold">60%</span></p><div className="h-1 bg-surface-lighter rounded-full relative"><div className="absolute w-4 h-4 bg-brand-light rounded-full -top-1.5 left-[60%] shadow-lg shadow-brand-primary/50" /></div></div>
          <div><p className="text-sm text-gray-400 mb-4 flex justify-between">Max Temperature <span className="text-white font-bold">38°C</span></p><div className="h-1 bg-surface-lighter rounded-full relative"><div className="absolute w-4 h-4 bg-brand-light rounded-full -top-1.5 left-[75%] shadow-lg shadow-brand-primary/50" /></div></div>
          <div><p className="text-sm text-gray-400 mb-4 flex justify-between">Max Wind Speed <span className="text-white font-bold">20km/h</span></p><div className="h-1 bg-surface-lighter rounded-full relative"><div className="absolute w-4 h-4 bg-brand-light rounded-full -top-1.5 left-[40%] shadow-lg shadow-brand-primary/50" /></div></div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Wifi className="w-5 h-5 text-gray-400"/> System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-surface/30 border border-white/5 p-4 rounded-lg flex items-center gap-3"><div className="glow-dot"/><div><p className="text-sm font-bold text-white">Kafka Broker</p><p className="text-xs text-gray-500">Connected</p></div></div>
           <div className="bg-surface/30 border border-white/5 p-4 rounded-lg flex items-center gap-3"><div className="glow-dot"/><div><p className="text-sm font-bold text-white">MongoDB</p><p className="text-xs text-gray-500">Connected</p></div></div>
           <div className="bg-surface/30 border border-white/5 p-4 rounded-lg flex items-center gap-3"><div className="glow-dot"/><div><p className="text-sm font-bold text-white">ML Pipeline</p><p className="text-xs text-gray-500">Active (3/5 models)</p></div></div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
