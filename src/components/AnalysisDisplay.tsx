
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  Lightbulb, 
  LayoutTemplate, 
  Network, 
  ShieldAlert, 
  Bug, 
  Zap, 
  Terminal, 
  Download, 
  FileText, 
  Copy,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

import { 
  MarkdownH2,
  MarkdownPre,
  MarkdownA,
  MarkdownCode,
  Mermaid,
  extractMermaid,
  removeMermaid,
  parsePhases
} from './MarkdownComponents';

// --- Types ---
export interface AnalysisResult {
  id: string;
  url: string;
  timestamp: number;
  repoName: string;
  markdown: string;
  nodeDetails?: Record<string, string>;
  categoryScores?: Record<string, number> | null;
  fileTree?: string[];
}

interface Phase {
  title: string;
  content: string;
  score?: string;
}

// --- Main Component ---
const getPhaseIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('intro') || t.includes('summary')) return Lightbulb;
  if (t.includes('architecture') || t.includes('structure')) return Network;
  if (t.includes('security')) return ShieldAlert;
  if (t.includes('bug') || t.includes('issue')) return Bug;
  if (t.includes('performance') || t.includes('optimization')) return Zap;
  if (t.includes('code') || t.includes('implementation')) return Terminal;
  if (t.includes('file') || t.includes('tree')) return FileText;
  return LayoutTemplate;
};

export const AnalysisDisplay = ({ analysis, theme }: { analysis: AnalysisResult, theme: 'dark' | 'light' }) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'tabs' | 'accordion'>('tabs');
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 0: true });
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<{ id: string, content: string } | null>(null);

  const phases = useMemo(() => parsePhases(analysis.markdown), [analysis.markdown]);

  const toggleAccordion = (index: number) => {
    setExpandedPhases(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const renderMarkdown = (content: string) => (
    <Markdown
      components={{
        h2: MarkdownH2,
        pre: MarkdownPre,
        code: (props) => <MarkdownCode {...props} theme={theme} onNodeClick={(nodeId) => {
          if (analysis.nodeDetails && analysis.nodeDetails[nodeId]) {
            setSelectedNodeDetails({ id: nodeId, content: analysis.nodeDetails[nodeId] });
          }
        }} />,
        a: MarkdownA,
      }}
    >
      {content}
    </Markdown>
  );

  return (
    <div className="w-full">
      {/* View Mode Switcher */}
      <div className="flex justify-end mb-6">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl flex gap-1 border border-black/5 dark:border-white/5">
          <button 
            onClick={() => setViewMode('tabs')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${viewMode === 'tabs' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            TABS
          </button>
          <button 
            onClick={() => setViewMode('accordion')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${viewMode === 'accordion' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            ACCORDION
          </button>
        </div>
      </div>

      {viewMode === 'tabs' ? (
        <div className="flex flex-col">
          {/* Tabs Navigation - Sticky & Mobile Native Style */}
          <div className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md -mx-4 px-4 py-4 mb-8 border-b border-black/5 dark:border-white/5">
            <div className="flex overflow-x-auto gap-2 no-scrollbar snap-x">
              {phases.map((phase, index) => {
                const Icon = getPhaseIcon(phase.title);
                const isActive = activePhaseIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => setActivePhaseIndex(index)}
                    className={`snap-start shrink-0 relative flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all border font-black text-[10px] uppercase tracking-widest ${
                      isActive 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20 scale-105 z-10' 
                        : 'bg-white dark:bg-zinc-900 border-black/5 dark:border-white/5 text-zinc-500 hover:border-indigo-500/30'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                    <span className="whitespace-nowrap">
                      {phase.title.split(':')[0].replace('PHASE ', 'P')}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-indigo-600 rounded-2xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Phase Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhaseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 lg:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    {React.createElement(getPhaseIcon(phases[activePhaseIndex].title), { className: "w-6 h-6 text-indigo-600 dark:text-indigo-400" })}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-tight">
                    {phases[activePhaseIndex].title}
                  </h3>
                </div>
                {phases[activePhaseIndex].score && (
                  <div className="self-start sm:self-center px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/20 tracking-widest">
                    SCORE: {phases[activePhaseIndex].score}/10
                  </div>
                )}
              </div>
              <div className="markdown-body prose prose-zinc dark:prose-invert max-w-none">
                {/* Category Scores - Special Display for Phase 12 or if it's the last phase and contains scores */}
                {(activePhaseIndex === 12 || activePhaseIndex === phases.length - 1) && analysis.categoryScores && (
                  <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.entries(analysis.categoryScores).map(([category, score]) => (
                      <div key={category} className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xl group hover:scale-[1.02] transition-all duration-500">
                        <div className="flex justify-between items-end mb-4">
                          <h4 className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{category}</h4>
                          <span className="text-3xl font-black text-zinc-900 dark:text-white">{score}<span className="text-xs text-zinc-400">/100</span></span>
                        </div>
                        <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${
                              score >= 80 ? 'from-emerald-500 to-teal-500' :
                              score >= 60 ? 'from-amber-500 to-orange-500' :
                              'from-rose-500 to-red-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mermaid Diagram Handling */}
                {extractMermaid(phases[activePhaseIndex].content) ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    <div className="min-w-0">
                      {renderMarkdown(removeMermaid(phases[activePhaseIndex].content))}
                    </div>
                    <div className="h-[700px] rounded-[2rem] border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/50 shadow-2xl flex flex-col min-w-0 overflow-hidden group">
                      <div className="p-6 border-b border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Network className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Architecture</div>
                            <div className="font-black text-zinc-900 dark:text-white leading-none">Interactive Map</div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                          Live View
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden relative">
                        <Mermaid 
                          chart={extractMermaid(phases[activePhaseIndex].content)!} 
                          theme={theme}
                          onNodeClick={(nodeId) => {
                            if (analysis.nodeDetails && analysis.nodeDetails[nodeId]) {
                              setSelectedNodeDetails({ id: nodeId, content: analysis.nodeDetails[nodeId] });
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  renderMarkdown(phases[activePhaseIndex].content)
                )}
              </div>

              {/* Node Details Modal */}
              <AnimatePresence>
                {selectedNodeDetails && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedNodeDetails(null)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden flex flex-col max-h-[80vh]"
                    >
                      <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Network className="w-5 h-5 text-indigo-500" />
                          </div>
                          <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight">Component Details: {selectedNodeDetails.id}</h4>
                        </div>
                        <button 
                          onClick={() => setSelectedNodeDetails(null)}
                          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-8 overflow-y-auto custom-scrollbar prose prose-zinc dark:prose-invert max-w-none">
                        {renderMarkdown(selectedNodeDetails.content)}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Accordion View */
        <div className="flex flex-col gap-4">
          {phases.map((phase, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden transition-all"
            >
              <button 
                onClick={() => toggleAccordion(index)}
                className="w-full p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${expandedPhases[index] ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                    {index}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white text-left">
                    {phase.title}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  {phase.score && (
                    <span className="text-xs font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                      {phase.score}/10
                    </span>
                  )}
                  {expandedPhases[index] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedPhases[index] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-black/5 dark:border-white/5"
                  >
                    <div className="p-8 markdown-body prose prose-zinc dark:prose-invert max-w-none">
                      {renderMarkdown(phase.content)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
