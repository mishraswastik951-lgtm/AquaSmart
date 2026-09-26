import React, { useState } from 'react';

const GeminiChat: React.FC = () => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([{ role: 'ai', text: 'Hello! I am your AquaSmart AI Agronomist. How can I help optimize your farm today?' }]);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setResponses([...responses, { role: 'user', text: query }, { role: 'ai', text: 'Processing your farm data and generating insights...' }]);
    setQuery('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 bg-indigo-600 text-white rounded-t-xl flex items-center space-x-2">
        <span className="text-2xl">✨</span>
        <h3 className="font-bold text-lg">Gemini AI Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {responses.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-900 rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAsk} className="p-4 border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about soil moisture, weather impacts, or crop health..." 
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
          Ask
        </button>
      </form>
    </div>
  );
};

export default GeminiChat;
