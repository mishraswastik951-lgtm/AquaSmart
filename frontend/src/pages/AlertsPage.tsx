import React from 'react';

const AlertsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Alert Center</h2>
        <p className="text-gray-500">System notifications and AI warnings</p>
      </header>

      <div className="space-y-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex justify-between">
            <h3 className="font-bold text-red-800">Critical: Low Soil Moisture</h3>
            <span className="text-sm text-red-500">10 mins ago</span>
          </div>
          <p className="text-red-700 mt-1">Sensor #4 in North Valley Estate reports moisture at 22% (Below 30% threshold).</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex justify-between">
            <h3 className="font-bold text-yellow-800">Warning: High Temperature Prediction</h3>
            <span className="text-sm text-yellow-600">2 hours ago</span>
          </div>
          <p className="text-yellow-700 mt-1">Gemini AI predicts temperatures exceeding 38°C tomorrow. Pre-irrigation recommended.</p>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
