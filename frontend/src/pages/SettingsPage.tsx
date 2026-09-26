import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">Account Settings</h2>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full Name</label>
              <input type="text" className="w-full border rounded p-2 bg-gray-50" defaultValue="AquaSmart Farmer" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email Address</label>
              <input type="email" className="w-full border rounded p-2 bg-gray-50" defaultValue="farmer@aquasmart.com" disabled />
            </div>
          </div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Save Changes</button>
        </div>

        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
              <span>Email Alerts for Critical Sensor Drops</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
              <span>Weekly Gemini AI Insight Reports</span>
            </label>
          </div>
        </div>

        <div className="p-6 bg-red-50">
          <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
          <button className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
