import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface AdBannerProps {
  depth?: string;
  height?: string;
  className?: string;
  text?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ height = 'h-24', className = '', text = 'Advertisement' }) => {
  return (
    <div className={`w-full ${height} ${className} flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden relative group`}>
      <span className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-bold">{text}</span>
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
