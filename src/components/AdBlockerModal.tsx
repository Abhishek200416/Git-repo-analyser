import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdBlockerModalProps {
  show: boolean;
  onClose: () => void;
}

export const AdBlockerModal: React.FC<AdBlockerModalProps> = ({
  show,
  onClose
}) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-2xl max-w-md w-full"
          >
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-4">Ad Blocker Detected</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
              We rely on ads to keep our services free for everyone. Please consider disabling your ad blocker for this site to help us continue providing high-quality analysis.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl transition-all text-xs uppercase tracking-widest"
              >
                Dismiss
              </button>
              <a
                href="https://github.com/sponsors/abhishek20040916"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Sponsor Project
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
