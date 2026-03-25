import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, X, Mail, Loader2 } from 'lucide-react';

interface RestoreAccessModalProps {
  show: boolean;
  onClose: () => void;
  onRestore: (email: string) => void;
  isRestoring: boolean;
}

export const RestoreAccessModal: React.FC<RestoreAccessModalProps> = ({
  show,
  onClose,
  onRestore,
  isRestoring
}) => {
  const [email, setEmail] = React.useState('');

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/80 z-[250] flex items-center justify-center p-4 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-indigo-600" />
                  Restore Access
                </h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  Enter the email address you used for your purchase. We'll check our database and restore your premium access instantly.
                </p>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => onRestore(email)}
                  disabled={!email || isRestoring}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isRestoring ? <Loader2 className="w-6 h-6 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                  RESTORE MY ACCESS
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
