import React from 'react';
import { Heart, Mail, Star } from 'lucide-react';

export const SponsorSection: React.FC = () => {
  return (
    <section className="mt-16 mb-16 px-6 lg:px-12 max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 p-10 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-pink-500/10 rounded-2xl border border-pink-500/20">
          <Heart className="w-8 h-8 text-pink-500" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Sponsor GitRepoAnalyzer</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm tracking-widest uppercase">Support the Future of Development</p>
        </div>
      </div>
      
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 font-medium">
        GitRepoAnalyzer is a passion project dedicated to providing developers with deep insights, security analysis, and automated code optimization. Your sponsorship helps us maintain our infrastructure, develop new AI-powered features, and keep the tool free for the community.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-black/5 dark:border-white/5">
          <h4 className="font-black text-zinc-900 dark:text-white uppercase text-sm mb-3">Why Sponsor Us?</h4>
          <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-2 list-disc list-inside">
            <li>Keep the tool free and accessible</li>
            <li>Accelerate AI feature development</li>
            <li>Support open-source innovation</li>
            <li>Get direct support and priority</li>
          </ul>
        </div>
        <div className="p-6 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <h4 className="font-black text-indigo-900 dark:text-indigo-100 uppercase text-sm mb-3">Partnership Benefits</h4>
          <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-2 list-disc list-inside">
            <li>Showcase your projects/work</li>
            <li>High-authority backlinks</li>
            <li>Increased visibility in the community</li>
            <li>Custom integration opportunities</li>
          </ul>
        </div>
      </div>

      <a
        href="mailto:abhishek20040916@gmail.com?subject=GitRepoAnalyzer Sponsorship Inquiry"
        className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-2xl uppercase tracking-widest text-sm"
      >
        <Mail className="w-4 h-4" />
        Inquire via Email
      </a>
    </section>
  );
};
