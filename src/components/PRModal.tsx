import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitPullRequest } from 'lucide-react';

interface PRModalProps {
  show: boolean;
  onClose: () => void;
  prConfig: { title: string; branch: string; body: string };
  setPrConfig: (config: { title: string; branch: string; body: string }) => void;
  onGenerate: () => void;
}

export const PRModal: React.FC<PRModalProps> = ({ show, onClose, prConfig, setPrConfig, onGenerate }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden"
          >
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <GitPullRequest className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Configure Pull Request</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs tracking-widest uppercase">GitHub Integration</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="pr-title" className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">PR Title</label>
                  <input 
                    id="pr-title"
                    type="text"
                    value={prConfig.title}
                    onChange={(e) => setPrConfig({...prConfig, title: e.target.value})}
                    placeholder="e.g., fix: address security vulnerabilities"
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-black/5 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="pr-branch" className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Target Branch</label>
                  <input 
                    id="pr-branch"
                    type="text"
                    value={prConfig.branch}
                    onChange={(e) => setPrConfig({...prConfig, branch: e.target.value})}
                    placeholder="e.g., fix/security-updates"
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-black/5 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="pr-description" className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">PR Description</label>
                  <textarea 
                    id="pr-description"
                    value={prConfig.body}
                    onChange={(e) => setPrConfig({...prConfig, body: e.target.value})}
                    placeholder="Describe the changes..."
                    rows={4}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-black/5 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black rounded-2xl transition-all uppercase tracking-widest text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={onGenerate}
                  className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 uppercase tracking-widest text-sm"
                >
                  Generate PR Commands
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
