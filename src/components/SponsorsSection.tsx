import React from 'react';
import { Heart } from 'lucide-react';

export const SponsorsSection = () => {
  const sponsors = [
    { name: 'Sponsor A', work: 'Software Development' },
    { name: 'Sponsor B', work: 'Cloud Infrastructure' },
    { name: 'Sponsor C', work: 'Design Services' },
  ];

  return (
    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-8 rounded-3xl border border-white/20 dark:border-white/10 shadow-sm mb-10">
      <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
        <Heart className="w-6 h-6 text-rose-500" />
        Our Sponsors
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((sponsor, index) => (
          <div key={index} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{sponsor.name}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{sponsor.work}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
