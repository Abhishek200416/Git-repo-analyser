import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Zap, Mail } from 'lucide-react';

interface FeedbackModalProps {
  show: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ show, onClose }) => {
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
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <MessageSquare className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-black mb-3 text-zinc-900 dark:text-white text-center tracking-tight uppercase">Feedback & Support</h2>
            <div className="space-y-4 mb-10">
              <p className="text-zinc-500 dark:text-zinc-400 text-center leading-relaxed font-medium">
                Your feedback helps us grow! Whether it's a bug report, a feature request, or just a friendly hello, we're all ears.
              </p>
              <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mb-2">How can we help?</p>
                <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                  <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-amber-500" /> Report a technical issue</li>
                  <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-amber-500" /> Request a new feature</li>
                  <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-amber-500" /> General inquiries</li>
                </ul>
              </div>
            </div>
            <a
              href={`mailto:abhishekollurii@gmail.com?subject=GitRepoAnalyzer Feedback&body=Hi, I have some feedback or a support request for GitRepoAnalyzer...`}
              className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-2xl uppercase tracking-widest text-sm"
            >
              <Mail className="w-6 h-6" />
              Send us a Message
            </a>
            <button
              onClick={onClose}
              className="w-full mt-6 py-3 text-zinc-500 font-black hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest text-xs"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
