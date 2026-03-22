import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Gift } from 'lucide-react';

export const PopupAd = ({ 
  show, 
  onClose, 
  text = "Limited Time Offer!" 
}: { 
  show: boolean, 
  onClose: () => void, 
  text?: string 
}) => {
  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white/20 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <button 
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500 dark:text-zinc-400 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">{text}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed">
            This exclusive content is brought to you by our premium sponsors. Support us by visiting our partners!
          </p>
          
          <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-6 border border-black/5 dark:border-white/5 mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-center shadow-sm">
                <Gift className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Sponsored</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-white">Premium AI Developer Tools</div>
              </div>
            </div>
            <button 
              onClick={() => window.open('https://github.com/sponsors/abhishek20040916', '_blank')}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-transform">
              Claim Your Discount
            </button>
          </div>

          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Continue to Application
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

