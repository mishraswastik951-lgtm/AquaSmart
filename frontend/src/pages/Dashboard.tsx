import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Dashboard: React.FC = () => {
  // const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Farm Overview</h2>
        <p className="text-gray-500">Welcome back to your AquaSmart dashboard.</p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Water Used Today</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">1,245 L</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Active Sensors</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">8 / 8</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Alerts</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">2 Pending</p>
        </div>
      </div>

      {/* Gemini AI Widget */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">✨</span>
          <h3 className="text-xl font-semibold text-indigo-900">Gemini AI Insights</h3>
        </div>
        <p className="text-indigo-800">
          Based on current soil moisture trends, you can delay irrigation in Zone B for 24 hours to save approximately 200L of water without impacting crop yield.
        </p>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition">
          Ask Gemini
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
