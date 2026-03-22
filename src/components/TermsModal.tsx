import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface TermsModalProps {
  show: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ show, onClose }) => {
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
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Terms of Service</h2>
              <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent space-y-6 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">1. Acceptance of Terms</h3>
                <p>By accessing and using GitRepoAnalyzer, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">2. Description of Service</h3>
                <p>GitRepoAnalyzer provides AI-powered analysis of GitHub repositories. The service is provided "as is" and we make no guarantees regarding the accuracy or completeness of the analysis.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">3. User Responsibilities</h3>
                <p>You are responsible for the repository links you provide. Ensure you have the right to analyze the repositories you submit.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">4. Limitations of Liability</h3>
                <p>GitRepoAnalyzer shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the service.</p>
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
