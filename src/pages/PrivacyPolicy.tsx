import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy = ({ onBack }: { onBack: () => void }) => (
  <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <button onClick={onBack} className="mb-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors">
      <ArrowLeft className="w-4 h-4" /> Back to Home
    </button>
    <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-8 tracking-tight">Privacy Policy</h1>
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">At GitRepoAnalyzer, we take your privacy seriously. This policy outlines how we handle your data when you use our repository intelligence platform.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">1. Data Collection</h2>
      <p>We collect minimal data required to provide our services, including GitHub repository URLs and basic analysis metadata. We do not store your source code permanently.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">2. Data Usage</h2>
      <p>Your data is used solely to generate architectural insights, security scans, and code quality reports. We do not sell your data to third parties.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">3. Security</h2>
      <p>We implement industry-standard security measures to protect your data from unauthorized access, alteration, or destruction.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">4. Changes to this Policy</h2>
      <p>We may update this policy periodically. We will notify you of any significant changes.</p>
    </div>
  </div>
);
