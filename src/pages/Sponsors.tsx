import React from 'react';
import { ArrowLeft, Heart } from 'lucide-react';

interface Sponsor {
  name: string;
  work: string;
}

const sponsors: Sponsor[] = [
  { name: 'Tech Solutions Inc.', work: 'Providing cutting-edge cloud infrastructure and scalable backend services.' },
  { name: 'Creative Design Studio', work: 'Specializing in intuitive UI/UX design and brand identity development.' },
  { name: 'Data Insights Corp.', work: 'Delivering advanced analytics and data-driven decision-making tools.' },
  { name: 'Secure Systems Ltd.', work: 'Focusing on cybersecurity audits and robust system architecture.' },
];

export const Sponsors = ({ onBack }: { onBack: () => void }) => (
  <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <button onClick={onBack} className="mb-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors">
      <ArrowLeft className="w-4 h-4" /> Back to Home
    </button>
    <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-8 tracking-tight">Our Sponsors</h1>
    <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">We are grateful to our sponsors who support our work. Their contributions help us maintain and improve our tools for the developer community.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sponsors.map((sponsor, index) => (
        <div key={index} className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <Heart className="w-8 h-8 text-rose-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">{sponsor.name}</h3>
          <p className="text-zinc-500 dark:text-zinc-400">{sponsor.work}</p>
        </div>
      ))}
    </div>
  </div>
);
