import React from 'react';
import { ArrowLeft, Mail, HelpCircle } from 'lucide-react';

export const Support = ({ onBack }: { onBack: () => void }) => (
  <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <button onClick={onBack} className="mb-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors">
      <ArrowLeft className="w-4 h-4" /> Back to Home
    </button>
    <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-8 tracking-tight">Support</h1>
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">Need help? We're here to assist you with any questions or issues you may have.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <Mail className="w-8 h-8 text-indigo-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Email Support</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Send us an email at abhishekollurii@gmail.com and we'll get back to you within 24 hours.</p>
        </div>
        
        <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <HelpCircle className="w-8 h-8 text-indigo-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">FAQ</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Check our FAQ section for answers to common questions about RepoAnalyzer.</p>
        </div>
      </div>
    </div>
  </div>
);
