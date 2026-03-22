import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Zap, Layers, CheckCircle2, Check, RotateCcw, CreditCard, Github, Code2, Terminal, Activity, ArrowRight, Minus } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  duration: string;
  basePrice: number;
  mrp: number;
  badge?: string | null;
  description: string;
  limits: Record<string, string | number>;
  features: string[];
}

interface PremiumModalProps {
  show: boolean;
  onClose: () => void;
  onRestore: () => void;
  onSelectPlan: (plan: Plan) => void;
  onSubscribe: (planId: string) => void;
  plans: Plan[];
  creditPacks: Plan[];
  calculateTotal: (price: number) => { base: number, gst: number, total: number };
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  show,
  onClose,
  onRestore,
  onSelectPlan,
  onSubscribe,
  plans,
  creditPacks,
  calculateTotal
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'credits'>('plans');

  const getCtaText = (planId: string) => {
    switch (planId) {
      case 'free': return 'Start Free';
      case 'day': return 'Get Day Pass';
      case 'week': return 'Choose Week Pass';
      case 'month': return 'Go Pro Monthly';
      case 'year': return 'Choose Best Value';
      default: return 'Buy Credits';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-[2rem] w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col my-auto relative"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-black/5 dark:border-white/5 flex items-start justify-between bg-white dark:bg-zinc-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Sparkles className="w-64 h-64 text-indigo-500" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
                  Upgrade Your Workflow
                </h2>
                <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium max-w-xl">
                  Choose the perfect plan to analyze, refactor, and secure your repositories with AI.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500 transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mt-8 px-4">
              <div className="bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-2xl flex gap-1">
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'plans' 
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Subscription Plans
                </button>
                <button
                  onClick={() => setActiveTab('credits')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'credits' 
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Add-on Credits
                </button>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              {activeTab === 'plans' ? (
                <>
                  {/* Pricing Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                    {plans.map((plan) => {
                      const { base, gst, total } = calculateTotal(plan.basePrice);
                      const isPopular = plan.id === 'month';
                      const isBestValue = plan.id === 'year';
                      
                      return (
                        <div 
                          key={plan.id}
                          className={`relative flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border transition-all ${
                            isPopular 
                              ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105 z-10' 
                              : isBestValue
                              ? 'border-emerald-500 shadow-xl shadow-emerald-500/10'
                              : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'
                          }`}
                        >
                          {plan.badge && (
                            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap ${
                              isPopular ? 'bg-indigo-500' : isBestValue ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}>
                              {plan.badge}
                            </div>
                          )}
                          
                          <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1">{plan.name}</h3>
                            <p className="text-xs text-zinc-500 mb-6 min-h-[40px]">{plan.description}</p>
                            
                            <div className="mb-6">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-zinc-900 dark:text-white">
                                  ₹{plan.id === 'free' ? '0' : total.toFixed(0)}
                                </span>
                                {plan.id !== 'free' && <span className="text-xs text-zinc-500 font-medium">/ {plan.duration}</span>}
                              </div>
                              {plan.id !== 'free' && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex justify-between text-[10px] text-zinc-400">
                                    <span>Base Price</span>
                                    <span>₹{base.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] text-zinc-400">
                                    <span>GST (18%)</span>
                                    <span>₹{gst.toFixed(2)}</span>
                                  </div>
                                  {plan.mrp > total && (
                                    <div className="text-[10px] text-emerald-500 font-bold mt-1">
                                      Save ₹{(plan.mrp - total).toFixed(0)} from MRP ₹{plan.mrp}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => {
                                if (plan.id === 'free') onClose();
                                else onSubscribe(plan.id);
                              }}
                              className={`w-full py-3 rounded-xl font-black text-sm transition-all mt-auto ${
                                isPopular 
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20' 
                                  : isBestValue
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                                  : plan.id === 'free'
                                  ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white'
                                  : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
                              }`}
                            >
                              {getCtaText(plan.id)}
                            </button>
                          </div>
                          
                          <div className="p-6 bg-zinc-50 dark:bg-zinc-950/50 border-t border-black/5 dark:border-white/5 rounded-b-3xl">
                            <ul className="space-y-3">
                              {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                  <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-indigo-500' : isBestValue ? 'text-emerald-500' : 'text-zinc-400'}`} />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feature Comparison Table */}
                  <div className="mt-16 bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden hidden md:block">
                    <div className="p-6 border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/50">
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white">Compare Plan Features</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="p-4 border-b border-black/5 dark:border-white/5 text-sm font-bold text-zinc-500 w-1/4">Features</th>
                            {plans.map(plan => (
                              <th key={plan.id} className="p-4 border-b border-black/5 dark:border-white/5 text-sm font-black text-zinc-900 dark:text-white text-center w-[15%]">
                                {plan.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: 'Quick Scans', key: 'quick' },
                            { label: 'Standard Scans', key: 'standard' },
                            { label: 'Deep Analyses', key: 'deep' },
                            { label: 'Fix Mode', key: 'fix' },
                            { label: 'Agent Tokens', key: 'tokens' },
                            { label: 'PDF Export', key: 'export' },
                            { label: 'Ad Experience', key: 'ads' },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                              <td className="p-4 border-b border-black/5 dark:border-white/5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                {row.label}
                              </td>
                              {plans.map(plan => (
                                <td key={plan.id} className="p-4 border-b border-black/5 dark:border-white/5 text-sm text-center text-zinc-600 dark:text-zinc-400">
                                  {plan.limits[row.key] === 'Yes' ? (
                                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                                  ) : plan.limits[row.key] === 'No' ? (
                                    <Minus className="w-5 h-5 text-zinc-300 dark:text-zinc-700 mx-auto" />
                                  ) : (
                                    <span className="font-bold">{plan.limits[row.key]}</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* Credit Packs */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creditPacks.map((pack) => {
                    const { base, gst, total } = calculateTotal(pack.basePrice);
                    return (
                      <div 
                        key={pack.id}
                        className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-6 flex flex-col hover:border-indigo-500/30 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white">{pack.name}</h3>
                            <p className="text-xs text-zinc-500">{pack.description}</p>
                          </div>
                          {pack.badge && (
                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                              {pack.badge}
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-6">
                          <div className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
                            ₹{total.toFixed(0)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-zinc-400">
                              <span>Base Price</span>
                              <span>₹{base.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-400">
                              <span>GST (18%)</span>
                              <span>₹{gst.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-6 flex-1">
                          {pack.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                              <Check className="w-3.5 h-3.5 text-indigo-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        <button 
                          onClick={() => onSubscribe(pack.id)}
                          className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-black rounded-xl transition-all text-sm group-hover:bg-indigo-600 group-hover:text-white"
                        >
                          Buy Credits
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button 
                onClick={onRestore}
                className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Restore Access by Email
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Secure Checkout</p>
                  <p className="text-[9px] text-zinc-500 font-bold">Powered by Razorpay</p>
                </div>
                <div className="p-2 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/5 dark:border-white/5">
                  <CreditCard className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
