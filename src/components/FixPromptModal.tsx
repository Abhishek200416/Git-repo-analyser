import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, X } from 'lucide-react';

interface FixPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFixAndZip: () => void;
}

export const FixPromptModal: React.FC<FixPromptModalProps> = ({
  isOpen,
  onClose,
  onFixAndZip
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Wand2 className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-center text-zinc-900 dark:text-white uppercase mb-4">Generate Fixes?</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-center leading-relaxed mb-8 font-medium">
              Can I clone the repo, update the code with proposed changes, and get you the zip so it will be much easier to download and run it?
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={onFixAndZip}
                  className="flex-1 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-lg uppercase tracking-widest text-xs"
                >
                  Fix & Zip
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
