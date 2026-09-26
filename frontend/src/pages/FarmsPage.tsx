import React from 'react';
import { Link } from 'react-router-dom';

const FarmsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">My Farms</h2>
          <p className="text-gray-500 mt-1">Manage your agricultural properties</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md">
          + Add New Farm
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Farm Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">North Valley Estate</h3>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Crop:</strong> Wheat</p>
            <p><strong>Area:</strong> 150 Hectares</p>
            <p><strong>Sensors:</strong> 8 Online</p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Dashboard →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmsPage;
