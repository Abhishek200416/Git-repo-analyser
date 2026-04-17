import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  show: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] p-10 border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-zinc-500"></div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Privacy Policy</h2>
              <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent space-y-6 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">1. Introduction</h3>
                <p>At GitRepoAnalyzer, we are committed to protecting your privacy. This policy outlines how we collect, use, and protect your information when you use our AI-powered repository analysis tool.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">2. Information We Collect</h3>
                <p>We collect minimal information to provide our services. This includes:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Repository URLs you provide for analysis.</li>
                  <li>Technical data such as browser type and IP address for security and performance monitoring.</li>
                  <li>Usage data to help us improve our service.</li>
                </ul>
                <p>We do not store your source code. We only process the repository URL and its public contents in a secure, ephemeral sandbox to generate the analysis report.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">3. How We Use Your Data</h3>
                <p>The data retrieved from GitHub is used solely for the purpose of providing you with the analysis report. We do not use your data for training models or any other purposes. Technical and usage data are used to improve our service, ensure security, and provide a better user experience.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">4. Third-Party Services</h3>
                <p>We use Google's Gemini AI to perform the analysis. Your data is processed securely according to Google's privacy standards. We may also use third-party analytics services to understand how our site is used, which may use cookies.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">5. Cookies</h3>
                <p>We use essential cookies to maintain your session and preferences. You can manage your cookie preferences in your browser settings or via our Cookie Policy section.</p>
              </section>
              <section>
                <h3 className="text-zinc-900 dark:text-white font-black uppercase text-sm tracking-widest mb-3">6. Your Rights</h3>
                <p>You have the right to access, correct, or delete your personal data. If you have any questions or concerns about your privacy, please contact us at abhishek20040916@gmail.com.</p>
              </section>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-8 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest text-sm"
            >
              I Understand
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
