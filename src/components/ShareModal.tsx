import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
  show: boolean;
  onClose: () => void;
  repoUrl: string;
}

export function ShareModal({ show, onClose, repoUrl }: ShareModalProps) {
  if (!show) return null;

  const appUrl = 'https://gitrepoanalyzer.com';
  
  // Create shareable text
  const shareText = `I just analyzed a repository using GitRepoAnalyzer! 🚀\n\nIt provides deep architectural insights, security reviews, and automated code fixes for any public GitHub project.\n\nTry it out on this repo or your own:`;
  const shareUrl = repoUrl ? `${appUrl}?repo=${encodeURIComponent(repoUrl)}` : appUrl;
  const fullMessage = `${shareText}\n\n${shareUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullMessage);
    toast.success('Message copied to clipboard!');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    // LinkedIn share URL format
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
              <Share2 className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">Share Analysis</h2>
              <p className="text-sm font-medium text-zinc-500">Spread the word about GitRepoAnalyzer</p>
            </div>
          </div>
          <button 
            onClick={onClose}
             className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-black/5 dark:border-white/5 mb-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{fullMessage}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Copy className="w-5 h-5" /> Copy Message
            </button>
            <button
              onClick={shareToWhatsApp}
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-white font-bold rounded-xl transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </button>
            <button
              onClick={shareToTwitter}
              className="flex items-center justify-center gap-2 w-full py-4 bg-black text-white font-bold rounded-xl transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Twitter className="w-5 h-5 fill-current" /> X / Twitter
            </button>
            <button
              onClick={shareToLinkedIn}
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#0A66C2] text-white font-bold rounded-xl transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Linkedin className="w-5 h-5 fill-current border-0" /> LinkedIn
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
