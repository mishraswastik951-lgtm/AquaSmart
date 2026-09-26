import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-6">AquaSmart</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
        The intelligent water management platform powered by Google Gemini AI and IoT sensors.
        Optimize your farm's irrigation and predict crop yields with precision.
      </p>
      
      <div className="flex space-x-4">
        <Link 
          to="/login" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Home;
