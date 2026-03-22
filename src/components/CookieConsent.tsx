import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface CookieConsentProps {
  show: boolean;
  onAccept: () => void;
  onShowDetails: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  show,
  onAccept,
  onShowDetails
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-8 lg:w-[400px] z-[1000]"
        >
          <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h4 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest">Cookie Consent</h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed mt-1">
                  We use essential cookies and local storage to save your analysis history and preferences. No tracking or ads.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onAccept}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-widest"
              >
                Accept All
              </button>
              <button
                onClick={onShowDetails}
                className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl transition-all text-xs uppercase tracking-widest border border-black/5 dark:border-white/5"
              >
                Details
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
