import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Zap, CreditCard, Play, RotateCcw } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  duration: string;
  basePrice: number;
  mrp: number;
  description: string;
  limits: Record<string, string | number>;
}

interface PlanDetailsModalProps {
  plan: Plan | null;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  onRestore: () => void;
}

export const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  plan,
  onClose,
  onSubscribe,
  onRestore
}) => {
  if (!plan) return null;

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
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">{plan.name}</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{plan.duration}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 font-medium">{plan.description}</p>
            
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-4 mb-6 border border-black/5 dark:border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Plan Limits</p>
                  {Object.entries(plan.limits).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} {plan.id.startsWith('credit') ? '' : 'Scans'}</span>
                      <span className="font-black text-zinc-900 dark:text-white">{value as string}</span>
                    </div>
                  ))}
                </div>
                <div className="border-l border-black/5 dark:border-white/5 pl-4 flex flex-col justify-center">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Pricing Breakdown</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-500">Base Price</span>
                      <span className="font-bold">₹{plan.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-500">GST (18%)</span>
                      <span className="font-bold">₹{(plan.basePrice * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-baseline">
                      <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase">Total</span>
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹{plan.mrp === 0 ? '0' : (plan.basePrice * 1.18).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-y border-black/5 dark:border-white/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">Priority Support</h4>
                  <p className="text-[10px] text-zinc-500 font-medium mt-1">Direct access to our expert engineering team for complex repo issues.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">Instant Activation</h4>
                  <p className="text-[10px] text-zinc-500 font-medium mt-1">Credits and features are unlocked immediately after successful payment.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {plan.id !== 'free' ? (
                <button 
                  onClick={() => onSubscribe(plan.id)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  {plan.id === 'day' ? 'Get Day Pass' : 
                   plan.id === 'week' ? 'Choose Week Pass' :
                   plan.id === 'month' ? 'Go Pro Monthly' : 'Choose Best Value'}
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  <Play className="w-4 h-4" />
                  Start Free
                </button>
              )}
              <button 
                onClick={onRestore}
                className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Access
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
