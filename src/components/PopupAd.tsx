import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

export const PopupAd: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-[200] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xl w-80"
      >
        <button onClick={() => setShow(false)} className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-600">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-zinc-900 dark:text-white">Special Offer</h4>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Check out our premium AI tools for developers!</p>
        <a href="#" className="block w-full py-2 bg-indigo-600 text-white text-center rounded-lg text-sm font-bold hover:bg-indigo-700">Learn More</a>
      </motion.div>
    </AnimatePresence>
  );
};
