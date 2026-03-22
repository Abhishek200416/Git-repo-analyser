import React from 'react';
import { diffLines } from 'diff';

interface DiffViewProps {
  oldText: string;
  newText: string;
}

export const DiffView: React.FC<DiffViewProps> = ({ oldText, newText }) => {
  const differences = diffLines(oldText, newText);
  return (
    <div className="font-mono text-xs sm:text-sm whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-black/10 dark:border-white/10 overflow-x-auto shadow-inner">
      {differences.map((part, index) => {
        const color = part.added ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10 border-l-2 border-emerald-500 dark:border-emerald-400' :
                      part.removed ? 'text-rose-700 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-400/10 line-through opacity-70 border-l-2 border-rose-500 dark:border-rose-400' :
                      'text-zinc-600 dark:text-zinc-400';
        return (
          <div key={index} className={`${color} px-3 py-1 my-0.5 rounded-r-sm break-all`}>
            {part.value}
          </div>
        );
      })}
    </div>
  );
};
