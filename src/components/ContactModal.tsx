import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Github, Twitter } from 'lucide-react';

interface ContactModalProps {
  show: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Contact Us</h3>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
              Have questions, feedback, or sponsorship inquiries? We'd love to hear from you.
            </p>

            <div className="space-y-4">
              <a href="mailto:abhishek20040916@gmail.com" className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-black/5 dark:border-white/5 hover:border-indigo-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Email Us</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">abhishek20040916@gmail.com</p>
                </div>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
