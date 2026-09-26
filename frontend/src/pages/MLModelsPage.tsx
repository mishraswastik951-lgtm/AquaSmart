import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';

const mockModels = [
  { id: 'm1', name: 'Random Forest', accuracy: 94.2, status: 'active', lastTrained: '2h ago', predictions: '1247 pred.' },
  { id: 'm2', name: 'XGBoost', accuracy: 96.1, status: 'active', lastTrained: '1h ago', predictions: '1891 pred.' },
  { id: 'm3', name: 'LSTM Neural Net', accuracy: 91.8, status: 'training', lastTrained: 'Training...', predictions: '0 pred.' },
];

const MLModelsPage = () => {
  return (
    <div className="max-w-6xl animate-in fade-in duration-500">
      <header className="flex items-center gap-3 mb-8">
        <Brain className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-extrabold text-white">ML Decision Models</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockModels.map((model, i) => (
          <motion.div 
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass-card-hover p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">{model.name}</h2>
              {model.status === 'active' ? (
                <CheckCircle2 className="w-5 h-5 text-brand-light" />
              ) : (
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
              )}
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Accuracy</span>
                <span className="font-bold text-brand-light">{model.accuracy}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-lighter rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${model.accuracy}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-brand-primary rounded-full"
                />
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 border-t border-white/5 pt-4">
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Last trained: {model.lastTrained}
              </span>
              <span>{model.predictions}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MLModelsPage;
