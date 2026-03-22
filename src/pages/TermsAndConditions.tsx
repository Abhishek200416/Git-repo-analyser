import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const TermsAndConditions = ({ onBack }: { onBack: () => void }) => (
  <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <button onClick={onBack} className="mb-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors">
      <ArrowLeft className="w-4 h-4" /> Back to Home
    </button>
    <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-8 tracking-tight">Terms and Conditions</h1>
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">By using GitRepoAnalyzer, you agree to these terms. Please read them carefully.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
      <p>By accessing or using our services, you agree to be bound by these terms.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">2. Use of Service</h2>
      <p>You may use our services for lawful purposes only. You are responsible for any content you analyze.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">3. Limitation of Liability</h2>
      <p>We are not responsible for any damages arising from your use of our service.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">4. Governing Law</h2>
      <p>These terms are governed by the laws of our jurisdiction.</p>
    </div>
  </div>
);
