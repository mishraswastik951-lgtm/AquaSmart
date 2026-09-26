import React from 'react';
import GeminiChat from '../components/AI/GeminiChat';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">AI Analytics & Reports</h2>
        <p className="text-gray-500">Deep insights powered by Google Gemini AI</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Weekly Water Efficiency</h3>
            <div className="h-48 bg-gray-50 rounded flex items-center justify-center border border-dashed border-gray-200">
              <span className="text-gray-400 font-medium">Chart visualization loading...</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Yield Prediction</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Expected Harvest</span>
                <span className="font-bold text-green-600">Oct 15, 2026</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Est. Total Yield</span>
                <span className="font-bold text-blue-600">4,200 Tons</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <GeminiChat />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
