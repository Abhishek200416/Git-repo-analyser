import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface CookieModalProps {
  show: boolean;
  onClose: () => void;
}

export const CookieModal: React.FC<CookieModalProps> = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] p-10 border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-zinc-500"></div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Cookie Policy</h2>
              <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent space-y-6 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">1. What are Cookies?</h3>
                <p>Cookies are small text files stored on your device when you visit a website. They help the website function properly and remember your preferences.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">2. Essential Cookies</h3>
                <p>We use essential cookies to maintain your session and save your theme preferences. These cookies are necessary for the website to work correctly.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">3. Analytics Cookies</h3>
                <p>We may use analytics cookies to understand how users interact with our service and improve its performance. These cookies do not collect personally identifiable information.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">4. Managing Cookies</h3>
                <p>You can control and manage cookies through your browser settings. However, disabling essential cookies may affect the functionality of the service.</p>
              </section>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-8 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest text-sm"
            >
              I Understand
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
