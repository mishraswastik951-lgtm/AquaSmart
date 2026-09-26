import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, LayoutDashboard, Tractor, Activity, Brain, Bell, Settings, User } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/farms', label: 'Farms', icon: Tractor },
  { path: '/sensors', label: 'Sensors', icon: Activity },
  { path: '/models', label: 'ML Models', icon: Brain },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/profile', label: 'Profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-bg border-r border-white/5 flex flex-col pt-6 pb-4">
      <div className="px-6 mb-10 flex items-center gap-3">
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Droplet className="w-8 h-8 text-brand-primary fill-brand-primary/20" />
        </motion.div>
        <span className="text-2xl font-bold tracking-tight text-gradient-primary">AquaSmart</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive ? "text-white" : "text-gray-400 hover:text-white hover:translate-x-1"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-white/5 rounded-lg border border-white/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3 w-full">
                <Icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-brand-light" : "text-gray-500")} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavDot"
                    className="ml-auto glow-dot"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <div className="flex items-center gap-2 py-3 border-t border-white/5">
          <div className="glow-dot"></div>
          <span className="text-xs text-gray-500 font-medium tracking-wide">System Online</span>
        </div>
      </div>
    </div>
  );
};
