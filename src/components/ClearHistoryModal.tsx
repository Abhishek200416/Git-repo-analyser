import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ClearHistoryModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearHistoryModal: React.FC<ClearHistoryModalProps> = ({ show, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-center text-zinc-900 dark:text-white uppercase mb-4">Clear All History?</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-center leading-relaxed mb-8">
              This will permanently delete all your saved analysis history. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
