import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Zap, History, Heart, Shield, BookOpen, Cpu, Star } from 'lucide-react';
import { FEATURES } from '../constants';

interface AboutModalProps {
  show: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden relative max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-20"></div>
            <button 
              onClick={onClose}
              aria-label="Close"
              className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-zinc-500 dark:text-zinc-400 transition-all z-30"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8 sm:p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <Info className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">About GitRepoAnalyzer</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm tracking-widest uppercase">Mission Control for Developers</p>
                </div>
              </div>
              
              <div className="space-y-12 mb-10">
                <section>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-amber-500" aria-hidden="true" /> The GitRepoAnalyzer Vision (2026)
                  </h3>
                  <div className="space-y-4 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    <p>
                      In 2026, GitRepoAnalyzer has evolved from a static analysis tool into a proactive partner in the software development lifecycle. We recognized a fundamental problem in modern software engineering: as projects grow in complexity, the "cognitive load" required to understand them grows exponentially. Traditional tools provide raw data—linting errors, cyclomatic complexity, or test coverage—but they fail to provide *understanding*.
                    </p>
                    <p>
                      Our platform is built on the belief that code is a narrative. Every repository tells a story of architectural decisions, technical debt, and innovative solutions. GitRepoAnalyzer uses advanced Large Language Models (LLMs), specifically Google's Gemini 3.1 Pro, to read this narrative. In 2026, our models have achieved a level of "Architectural Wisdom," allowing them to understand not just the syntax, but the long-term implications of design choices.
                    </p>
                    <p>
                      By bridging the gap between low-level source code and high-level architectural foresight, we enable teams to move faster with higher confidence. Whether you're onboarding a new engineer, performing a security audit, or planning a major refactor, GitRepoAnalyzer provides the clarity you need to make informed decisions in the fast-paced world of 2026.
                    </p>
                    <p>
                      Our long-term vision is to create a "Self-Healing Codebase." In 2026, we've taken the first steps toward this future with "Autonomous Remediation," where the AI proactively identifies weaknesses and proposes fixes before they impact production. GitRepoAnalyzer is the tireless, AI-powered senior engineer that lives within your 2026 CI/CD pipeline.
                    </p>
                  </div>
                </section>

                <section className="p-8 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/20">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-indigo-500" aria-hidden="true" /> Why We Are Different in 2026
                  </h3>
                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <h4 className="font-black text-zinc-900 dark:text-white uppercase text-sm tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Contextual Intelligence (2M Token Window)
                      </h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Unlike traditional linters that look at files in isolation, GitRepoAnalyzer analyzes your entire repository as a single cohesive unit. In 2026, we leverage the full 2M token context window of Gemini 3.1 Pro, allowing us to ingest entire codebases at once. This provides a "God's Eye View" of your architecture, identifying cross-file dependencies and global state patterns that fragmented tools simply cannot perceive.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-black text-zinc-900 dark:text-white uppercase text-sm tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Predictive Security & Zero-Day Detection
                      </h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        We don't just find known CVEs. Our AI identifies "logic bombs" and subtle security anti-patterns that might not be in any database yet. In 2026, our security engine is integrated with real-time threat intelligence, allowing it to predict how an attacker might exploit your specific business logic. Our model is trained on millions of real-world exploits, providing a level of protection that is unparalleled in the industry.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-black text-zinc-900 dark:text-white uppercase text-sm tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Automated Remediation & Fix Patches
                      </h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Finding a problem is only half the battle. GitRepoAnalyzer generates production-ready patches that you can apply with a single click. In 2026, these patches are "context-aware," meaning they follow your project's specific coding style and naming conventions. This isn't just "find and replace"—it's intelligent refactoring that understands the downstream impact of every change.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-black text-zinc-900 dark:text-white uppercase text-sm tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Multi-Agent Analysis Loop (2026)
                      </h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Our analysis is a collaborative effort between specialized AI agents. In 2026, these agents have become even more specialized, with dedicated roles for things like "Cloud Infrastructure Cost Optimization" and "Accessibility Compliance." These agents debate their findings in a "virtual war room" before synthesizing a final, high-confidence report for you.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-emerald-500" aria-hidden="true" /> Security & Compliance (2026)
                  </h3>
                  <div className="space-y-4 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    <p>
                      Security is woven into the very fabric of GitRepoAnalyzer. In 2026, we operate on a "Zero-Trust" architecture. When you provide a repository URL, our system creates a temporary, isolated sandbox to perform the analysis. No code is ever persisted on our servers beyond the duration of the analysis session. Once the report is generated, the sandbox is securely wiped, ensuring that your intellectual property remains entirely yours.
                    </p>
                    <p>
                      We utilize Google's enterprise-grade Gemini infrastructure, ensuring that your data is handled with the highest level of encryption and compliance. In 2026, our security reviews cover the OWASP Top 10, SANS Top 25, and industry-specific compliance standards like SOC2, HIPAA, and GDPR. We also perform "Secret Scanning" to ensure that no API keys or sensitive credentials have been accidentally committed.
                    </p>
                    <p>
                      For enterprise customers in 2026, we offer "Private Cloud" deployments where the analysis engine runs entirely within your own VPC, ensuring that your most sensitive intellectual property never leaves your controlled environment.
                    </p>
                  </div>
                </section>

                <section className="p-8 bg-amber-500/5 dark:bg-amber-500/10 rounded-[2.5rem] border border-amber-500/20">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-amber-500" aria-hidden="true" /> Hidden Features & Pro Tips
                  </h3>
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      </div>
                      <div>
                        <h5 className="font-black text-zinc-900 dark:text-white uppercase text-sm mb-1">Deep Dependency Graphing</h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Type <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">/graph</code> in the chat to generate a visual representation of your module dependencies. This helps you identify circular imports, tightly coupled components, and potential architectural bottlenecks that are invisible in the source code.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      </div>
                      <div>
                        <h5 className="font-black text-zinc-900 dark:text-white uppercase text-sm mb-1">Performance Bottleneck Detection</h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Our AI can identify O(n²) operations in your loops and suggest optimized algorithms automatically. It also detects memory leaks in JavaScript/TypeScript by analyzing closure patterns and event listener management, providing you with a more performant and stable application.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      </div>
                      <div>
                        <h5 className="font-black text-zinc-900 dark:text-white uppercase text-sm mb-1">Technical Debt Estimation</h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Get a "Debt Score" that estimates how many developer-hours are required to refactor problematic areas of your code. This allows project managers to prioritize refactoring tasks based on their actual impact on development velocity and long-term maintenance costs.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      </div>
                      <div>
                        <h5 className="font-black text-zinc-900 dark:text-white uppercase text-sm mb-1">Semantic Code Search</h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Use the chat to ask questions like "Where do we handle user authentication?" or "How is the payment flow implemented?". Our AI performs a semantic search, finding the relevant code even if you don't use the exact keywords, saving you hours of manual exploration.</p>
                      </div>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 border-b border-black/5 dark:border-white/5 pb-2">Core Features & Capabilities</h3>
                  <div className="w-full grid gap-6 max-w-full">
                    {FEATURES.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.id} className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 group hover:border-indigo-500/30 transition-all shadow-sm">
                          <div className="w-12 h-12 shrink-0 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-black/5 dark:border-white/5 mx-auto sm:mx-0">
                            <Icon className="w-6 h-6 text-indigo-500" aria-label={`Icon for ${feature.title}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-black text-zinc-900 dark:text-white uppercase text-xs tracking-tight truncate">{feature.title}</h4>
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed font-medium break-words">{feature.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-black/5 dark:border-white/5">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                    <History className="w-6 h-6 text-indigo-500" aria-hidden="true" /> Detailed Roadmap (2026)
                  </h3>
                  <div className="space-y-6">
                    <div className="relative pl-8 border-l-2 border-indigo-500/30 space-y-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-zinc-900"></div>
                      <h4 className="font-black text-zinc-900 dark:text-white uppercase text-xs tracking-widest">Q2 2026: Advanced Refactoring & Cross-Language Porting</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">We are launching our "Cross-Language Porting" feature, which allows you to port logic between languages (e.g., Python to Rust) with full semantic parity. This includes migrating from Class components to Functional components in React, and automatically generating TypeScript types from existing JavaScript code.</p>
                    </div>
                    <div className="relative pl-8 border-l-2 border-indigo-500/30 space-y-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900"></div>
                      <h4 className="font-black text-zinc-900 dark:text-white uppercase text-xs tracking-widest">Q3 2026: Real-Time Collaborative Architecture Design</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">We are introducing "Architectural Whiteboards," where multiple developers can interact with the AI to design and simulate system changes in real-time. This will be a game-changer for remote teams, allowing you to see the AI's impact analysis as you sketch out new features.</p>
                    </div>
                    <div className="relative pl-8 border-l-2 border-indigo-500/30 space-y-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900"></div>
                      <h4 className="font-black text-zinc-900 dark:text-white uppercase text-xs tracking-widest">Q4 2026: AI-Powered Documentation & Knowledge Graph</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">Our AI will automatically generate and maintain a "Project Knowledge Graph," linking code, documentation, and historical decisions. It will track changes in your code and update the documentation in real-time, ensuring that your team always has the latest information.</p>
                    </div>
                    <div className="relative pl-8 border-l-2 border-indigo-500/30 space-y-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900"></div>
                      <h4 className="font-black text-zinc-900 dark:text-white uppercase text-xs tracking-widest">2027: The Autonomous Ecosystem</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">Our ultimate goal is to create an ecosystem that manages itself. This includes automated dependency updates, proactive security patching, and self-optimizing performance tuning. We want to free developers from the "drudgery" of maintenance, allowing them to focus entirely on innovation.</p>
                    </div>
                  </div>
                </section>

                <section className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-black/5 dark:border-white/5">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                    <History className="w-6 h-6 text-indigo-500" aria-hidden="true" /> Technical Architecture (2026)
                  </h3>
                  <div className="space-y-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                    <p>GitRepoAnalyzer is built on a modern, high-performance stack designed for the 2026 landscape. Our frontend is a React-based Single Page Application (SPA) powered by Vite, utilizing Tailwind CSS for a responsive, utility-first design system. We use Framer Motion for smooth, hardware-accelerated animations and Lucide React for consistent, crisp iconography.</p>
                    <p>The backend is an Express.js server running on Node.js, which handles API requests and orchestration of the AI analysis pipeline. In 2026, we use the Firebase Admin SDK for secure server-side operations and Firestore for real-time data synchronization. Our AI engine is powered by Google's Gemini 3.1 Pro, accessed via the @google/genai SDK, which provides state-of-the-art reasoning and code understanding capabilities.</p>
                    <p>For security, we implement a "Zero-Trust" model. All repository analysis is performed in isolated, ephemeral sandboxes. In 2026, we use Firebase Authentication for secure user management and Firestore Security Rules to ensure that data is only accessible to authorized users. Our CI/CD pipeline is fully automated, ensuring that every commit is analyzed for quality and security before being deployed.</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                    <History className="w-6 h-6 text-indigo-500" aria-hidden="true" /> Evolution of Analysis
                  </h3>
                  <div className="space-y-4 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    <p>
                      We don't just analyze code; we track its evolution. Our platform allows you to compare different versions of your repository, helping you visualize how your architecture and security posture change over time. This historical perspective is crucial for maintaining long-term code health.
                    </p>
                    <p>
                      By integrating with your GitHub Webhooks, GitRepoAnalyzer can perform "Continuous Analysis," providing feedback on every single commit. This ensures that technical debt is addressed as it's created, rather than piling up over months or years.
                    </p>
                  </div>
                </section>


                <section className="bg-indigo-500/5 dark:bg-indigo-500/10 p-8 rounded-[2rem] border border-indigo-500/20 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Heart className="w-10 h-10 text-pink-500 mx-auto mb-4 animate-pulse relative z-10" />
                  <h4 className="text-xl font-black text-zinc-900 dark:text-white mb-3 relative z-10">Thanks for visiting!</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed relative z-10">
                    We are constantly working to improve GitRepoAnalyzer. Your support helps us keep the AI free and sustainable for everyone. Whether you're a solo developer or part of a large team, we're here to help you ship better code.
                  </p>
                </section>

                <section className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                    </div>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Privacy & Security First</h4>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    We take your privacy seriously. GitRepoAnalyzer does not store your source code. All analysis is performed in real-time using Google's secure Gemini AI infrastructure. Your repository data is only used for the generation of your specific analysis report.
                  </p>
                </section>
              </div>
              
              <button 
                onClick={onClose}
                className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
              >
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
