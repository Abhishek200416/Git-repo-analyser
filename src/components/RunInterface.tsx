import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  MessageSquare, 
  Play, 
  X, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ExternalLink,
  Cpu,
  Zap,
  Layout,
  FileCode,
  Activity,
  ChevronRight,
  Send,
  Loader2,
  Sparkles,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Download
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RunInterfaceProps {
  onClose: () => void;
  extractedFiles: Record<string, string>;
  runStatus: string[];
  runChat: ChatMessage[];
  onSendMessage: (message: string) => void;
  isThinking: boolean;
  previewUrl?: string;
  onDownloadZip?: () => void;
  agentTokens?: number;
}

export const RunInterface: React.FC<RunInterfaceProps> = ({
  onClose,
  extractedFiles,
  runStatus,
  runChat,
  onSendMessage,
  isThinking,
  previewUrl,
  onDownloadZip,
  agentTokens = 0
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const statusEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [runChat]);

  useEffect(() => {
    statusEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [runStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col overflow-hidden"
    >
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
              AI Agent Runtime
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full border border-emerald-500/20 animate-pulse">
                ACTIVE
              </span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
              {Object.keys(extractedFiles).length} Files Extracted • Virtual Sandbox
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-white/5 rounded-lg">
            <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Tokens</span>
            <span className="text-indigo-400 text-sm font-bold">{agentTokens}</span>
          </div>
          <button
            onClick={() => {
              if (onDownloadZip) {
                onDownloadZip();
              }
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Download className="w-4 h-4" />
            Download ZIP
          </button>
          <div className="hidden sm:flex items-center bg-zinc-800/50 rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('tablet')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'tablet' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 mx-2" />

          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Chat & Preview (Notes) */}
        <div className="flex-1 flex flex-col border-r border-white/10 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center bg-zinc-900/30 border-b border-white/5 px-4 shrink-0">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all relative ${activeTab === 'chat' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Agent Chat
              </div>
              {activeTab === 'chat' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all relative ${activeTab === 'preview' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                Live Preview
              </div>
              {activeTab === 'preview' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === 'chat' ? (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                    {runChat.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-zinc-800/50 text-zinc-200 border border-white/5 rounded-tl-none'
                        }`}>
                          <div className="flex items-center gap-2 mb-2 opacity-50">
                            {msg.role === 'user' ? (
                              <span className="text-[10px] font-black uppercase tracking-tighter">You</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">AI Agent</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isThinking && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-800/50 rounded-2xl p-4 border border-white/5 rounded-tl-none flex items-center gap-3">
                          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                          <span className="text-xs text-zinc-400 font-medium">Agent is processing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-white/10 bg-zinc-900/50">
                    <form onSubmit={handleSubmit} className="relative">
                      <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask the agent to fix code, add features, or run tests..."
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500/50 transition-all outline-none"
                      />
                      <button 
                        type="submit"
                        disabled={!input.trim() || isThinking}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:bg-zinc-800 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0 flex flex-col bg-zinc-900"
                >
                  <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                    <div className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500 ${
                      viewMode === 'desktop' ? 'w-full h-full' : 
                      viewMode === 'tablet' ? 'w-[768px] h-[1024px] max-w-full max-h-full' : 
                      'w-[375px] h-[667px] max-w-full max-h-full'
                    }`}>
                      {previewUrl ? (
                        <iframe 
                          src={previewUrl}
                          className="w-full h-full border-none"
                          title="Project Preview"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-4 p-8 text-center">
                          <div className="p-4 bg-zinc-100 rounded-full">
                            <Monitor className="w-12 h-12 text-zinc-300" />
                          </div>
                          <div>
                            <h3 className="text-zinc-900 font-bold mb-1">Preview Not Started</h3>
                            <p className="text-sm text-zinc-500 max-w-xs">Ask the AI Agent to "run the application" to generate a live preview link.</p>
                          </div>
                          <button 
                            onClick={() => onSendMessage("Run the application and show me a preview")}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all"
                          >
                            Start Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel: Status & Logs */}
        <div className="w-full lg:w-80 bg-zinc-950 flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Activity Log</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-zinc-800" />
              <div className="w-2 h-2 rounded-full bg-zinc-800" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 scrollbar-thin scrollbar-thumb-white/10">
            {runStatus.map((status, i) => (
              <div key={i} className="flex gap-3 text-zinc-500 group">
                <span className="text-zinc-700 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                <span className="text-zinc-300 group-last:text-emerald-400 transition-colors">
                  <span className="text-emerald-500 mr-2">›</span>
                  {status}
                </span>
              </div>
            ))}
            <div ref={statusEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-white/5 bg-zinc-900/30">
            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Quick Commands</h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onSendMessage("Check for security vulnerabilities")}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg text-[10px] text-zinc-400 hover:text-white transition-all text-left flex items-center gap-2"
              >
                <ShieldAlert className="w-3 h-3 text-red-400" />
                Audit Security
              </button>
              <button 
                onClick={() => onSendMessage("Optimize the code performance")}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg text-[10px] text-zinc-400 hover:text-white transition-all text-left flex items-center gap-2"
              >
                <Zap className="w-3 h-3 text-yellow-400" />
                Optimize
              </button>
              <button 
                onClick={() => onSendMessage("Add unit tests for core logic")}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg text-[10px] text-zinc-400 hover:text-white transition-all text-left flex items-center gap-2"
              >
                <FileCode className="w-3 h-3 text-blue-400" />
                Add Tests
              </button>
              <button 
                onClick={() => onSendMessage("Explain the project structure")}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg text-[10px] text-zinc-400 hover:text-white transition-all text-left flex items-center gap-2"
              >
                <Layout className="w-3 h-3 text-purple-400" />
                Explain Repo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-indigo-600 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/90">
            <Activity className="w-3 h-3" />
            System: Online
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/90">
            <Cpu className="w-3 h-3" />
            CPU: 12%
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/90">
            <Zap className="w-3 h-3" />
            Latency: 42ms
          </div>
        </div>
        <div className="text-[10px] font-bold text-white/70 italic">
          AI Agent is monitoring your sandbox environment
        </div>
      </footer>
    </motion.div>
  );
};

import { ShieldAlert } from 'lucide-react';
