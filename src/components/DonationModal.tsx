import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Mail, Coffee } from 'lucide-react';

interface DonationModalProps {
  show: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ show, onClose }) => {
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
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden relative p-8 sm:p-10 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
            
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-pink-500/10 rounded-[2rem] flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Heart className="w-10 h-10 text-pink-500 fill-pink-500 relative z-10 animate-pulse" />
              </div>
            </div>

            <h2 className="text-3xl font-black mb-3 text-zinc-900 dark:text-white text-center tracking-tight uppercase">Donate and Support</h2>
            <div className="space-y-6 mb-10">
              <p className="text-zinc-500 dark:text-zinc-400 text-center leading-relaxed font-medium text-sm">
                Your contributions directly fuel the development of advanced AI features and keep this project free and open for the developer community.
              </p>
              
              <p className="text-zinc-500 dark:text-zinc-400 text-center text-xs leading-relaxed font-medium italic">
                "Your direct support allows us to maintain a zero-gate policy for our community."
              </p>
            </div>
            
            <div className="space-y-3">
              {/* Replace the href below with your actual donation link like BuyMeACoffee, PayPal, or UPI */}
              <a
                href="mailto:abhishek20040916@gmail.com?subject=GitRepoAnalyzer Donation/Support"
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-2xl uppercase tracking-widest text-xs"
              >
                <Coffee className="w-4 h-4" />
                Support the Project
              </a>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-6 py-3 text-zinc-500 font-black hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest text-xs"
            >
              Maybe Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
