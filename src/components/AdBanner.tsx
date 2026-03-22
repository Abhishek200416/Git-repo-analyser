import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ExternalLink, PlayCircle, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type AnalysisDepth = 'quick' | 'standard' | 'deep';

export const AdBanner = ({ 
  className = "", 
  height = "h-24", 
  text = "Advertisement Space", 
  slotId,
  depth = 'standard'
}: { 
  className?: string, 
  height?: string, 
  text?: string, 
  slotId?: string,
  depth?: AnalysisDepth
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const adRef = useRef<HTMLModElement>(null);
  const clientId = 'ca-pub-4365607109967193';
  const actualSlotId = slotId || 'f08c47fec0942fa0f';
  const isCompact = height.includes('h-10') || height.includes('h-12') || height.includes('h-8');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const pushAd = () => {
      try {
        if (typeof window !== 'undefined' && adRef.current) {
          // Check if already initialized
          if (adRef.current.getAttribute('data-adsbygoogle-status') === 'done' || adRef.current.hasChildNodes()) {
            return;
          }
          
          // Check if it has width to prevent availableWidth=0 error
          if (adRef.current.clientWidth === 0) {
            timeoutId = setTimeout(pushAd, 200);
            return;
          }

          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e: any) {
        // Ignore common benign AdSense errors
        if (e.message && (e.message.includes('already have ads') || e.message.includes('availableWidth=0'))) {
          return;
        }
        console.error('AdSense error:', e);
      }
    };

    pushAd();

    const checkAd = setTimeout(() => {
      if (adRef.current && adRef.current.offsetHeight === 0) {
        setAdBlockDetected(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(checkAd);
    };
  }, []);

  // Strategic visibility logic
  const shouldShow = useMemo(() => {
    return true;
  }, []);

  if (!shouldShow) return null;

  return (
    <AnimatePresence mode="wait">
      {isDismissed ? (
        <motion.div 
          key="dismissed"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`w-full flex justify-center items-center py-2 ${className}`}
        >
          <button 
            onClick={() => setIsDismissed(false)} 
            className="text-[10px] font-bold text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all hover:scale-105 hover:tracking-widest flex items-center gap-2 uppercase tracking-wider group"
          >
            <PlayCircle className="w-3.5 h-3.5 group-hover:animate-pulse" /> Show Sponsor
          </button>
        </motion.div>
      ) : (
        <motion.div 
          key="ad"
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className={`w-full bg-gradient-to-br from-zinc-100 to-zinc-200/50 dark:from-zinc-900 dark:to-zinc-950/50 border border-black/5 dark:border-white/5 flex flex-col justify-center items-center text-zinc-700 dark:text-zinc-300 text-[10px] sm:text-xs font-bold tracking-widest uppercase overflow-hidden relative group/banner rounded-3xl shadow-inner ad-banner-container ${height} ${className}`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTUwLCAxNTAsIDE1MCwgMC4xKSIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay"></div>
          
          <button 
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 p-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg opacity-100 sm:opacity-0 sm:group-hover/banner:opacity-100 transition-all z-20 hover:scale-110 shadow-sm backdrop-blur-sm"
            title="Dismiss Ad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div className="w-full h-full relative z-10 flex items-center justify-center overflow-hidden">
            {adBlockDetected ? (
              <a href="https://github.com/sponsors/abhishek20040916" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-indigo-500 transition-colors group">
                <Gift className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">{text || "Sponsor this project"}</span>
              </a>
            ) : (
              <ins 
                   ref={adRef}
                   className="adsbygoogle"
                   style={{ display: 'block', width: '100%', height: '100%' }}
                   data-ad-client={clientId}
                   data-ad-slot={actualSlotId}
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

