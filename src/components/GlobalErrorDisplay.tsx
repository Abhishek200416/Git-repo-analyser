import React, { createContext, useContext, useState, ReactNode } from 'react';
import { XCircle } from 'lucide-react';

interface ErrorContextType {
  showError: (message: string) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => setError(message);
  const hideError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}
      {error && (
        <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-red-500/20 rounded-3xl p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-start gap-4">
              <XCircle className="w-8 h-8 text-red-500 shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Error</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
              </div>
            </div>
            <button
              onClick={hideError}
              className="mt-6 w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) throw new Error('useError must be used within an ErrorProvider');
  return context;
};
