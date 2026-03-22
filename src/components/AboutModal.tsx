import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Zap, History, Heart, Shield } from 'lucide-react';
import { FEATURES } from '../constants';

interface AboutModalProps {
  show: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden relative max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-20"></div>
            <button 
              onClick={onClose}
              aria-label="Close"
              className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-zinc-500 dark:text-zinc-400 transition-all z-30"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8 sm:p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <Info className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">About GitRepoAnalyzer</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm tracking-widest uppercase">Mission Control for Developers</p>
                </div>
              </div>
              
              <div className="space-y-10 mb-10">
                <section>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" aria-hidden="true" /> Our Mission
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    GitRepoAnalyzer is an advanced AI-driven platform designed to provide developers with deep insights into their GitHub repositories. We believe that understanding code should be as fast as writing it. Our mission is to empower developers with architectural foresight and security intelligence.
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mt-4">
                    In an era of rapid software development, the ability to quickly grasp the nuances of a new codebase is invaluable. GitRepoAnalyzer leverages the latest advancements in Large Language Models to bridge the gap between raw code and high-level understanding.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 border-b border-black/5 dark:border-white/5 pb-2">Core Features & Capabilities</h3>
                  <div className="w-full grid gap-6 max-w-full">
                    {FEATURES.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.id} className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 group hover:border-indigo-500/30 transition-all shadow-sm">
                          <div className="w-10 h-10 shrink-0 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-black/5 dark:border-white/5 mx-auto sm:mx-0">
                            <Icon className="w-5 h-5 text-indigo-500" aria-label={`Icon for ${feature.title}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <h4 className="font-black text-zinc-900 dark:text-white uppercase text-[10px] tracking-tight truncate">{feature.title}</h4>
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400 text-[9px] leading-snug font-medium break-words">{feature.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-500" aria-hidden="true" /> Evolution of Analysis
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    We don't just analyze code; we track its evolution. Our platform allows you to compare different versions of your repository, helping you visualize how your architecture and security posture change over time. This historical perspective is crucial for maintaining long-term code health.
                  </p>
                </section>

                <section className="bg-indigo-500/5 dark:bg-indigo-500/10 p-8 rounded-[2rem] border border-indigo-500/20 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Heart className="w-10 h-10 text-pink-500 mx-auto mb-4 animate-pulse relative z-10" />
                  <h4 className="text-xl font-black text-zinc-900 dark:text-white mb-3 relative z-10">Thanks for visiting!</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed relative z-10">
                    We are constantly working to improve GitRepoAnalyzer. Your support helps us keep the AI free and sustainable for everyone. Whether you're a solo developer or part of a large team, we're here to help you ship better code.
                  </p>
                </section>

                <section className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                    </div>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Privacy & Security First</h4>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    We take your privacy seriously. GitRepoAnalyzer does not store your source code. All analysis is performed in real-time using Google's secure Gemini AI infrastructure. Your repository data is only used for the generation of your specific analysis report.
                  </p>
                </section>
              </div>
              
              <button 
                onClick={onClose}
                className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
              >
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
