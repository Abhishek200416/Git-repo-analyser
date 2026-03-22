import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Cpu, Zap, ShieldCheck, Globe } from 'lucide-react';

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
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-10 border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-pink-500"></div>
            <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
            </div>
            <h2 className="text-3xl font-black mb-3 text-zinc-900 dark:text-white text-center tracking-tight uppercase">Support Our Vision</h2>
            <div className="space-y-4 mb-10">
              <p className="text-zinc-500 dark:text-zinc-400 text-center leading-relaxed font-medium">
                Your support directly fuels the development of advanced AI features and code optimization capabilities.
              </p>
              <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mb-2">Our Mission</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  We are committed to providing developers with the most powerful tools for repository analysis and code optimization. Your contributions help us maintain our infrastructure and keep our core features accessible to the community.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-black/5 dark:border-white/5 text-center">
                  <Cpu className="w-5 h-5 text-indigo-500 mx-auto mb-1" aria-hidden="true" />
                  <p className="text-[10px] font-black uppercase text-zinc-500">AI Compute</p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-black/5 dark:border-white/5 text-center">
                  <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" aria-hidden="true" />
                  <p className="text-[10px] font-black uppercase text-zinc-500">Fast Analysis</p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-black/5 dark:border-white/5 text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" aria-hidden="true" />
                  <p className="text-[10px] font-black uppercase text-zinc-500">Security Audits</p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-black/5 dark:border-white/5 text-center">
                  <Globe className="w-5 h-5 text-blue-500 mx-auto mb-1" aria-hidden="true" />
                  <p className="text-[10px] font-black uppercase text-zinc-500">Global Access</p>
                </div>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-center text-sm leading-relaxed">
                For donation inquiries or support related questions, please contact us via email.
              </p>
            </div>
            <a
              href="https://github.com/sponsors/abhishek20040916"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-2xl uppercase tracking-widest text-sm"
            >
              <Heart className="w-6 h-6" />
              Sponsor via GitHub
            </a>
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
