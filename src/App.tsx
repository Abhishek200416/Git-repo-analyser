import React, { useState, useEffect, useMemo, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { diffLines } from 'diff';
import { motion, AnimatePresence } from 'motion/react';
import mermaid from 'mermaid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Search, 
  History, 
  ShieldAlert, 
  Code2, 
  LayoutTemplate, 
  Lightbulb, 
  Trash2, 
  ExternalLink, 
  Copy,
  Loader2,
  Github,
  GitCompare,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  RotateCcw,
  Terminal,
  Zap,
  Activity,
  Menu,
  X,
  Settings,
  PlayCircle,
  Sun,
  Moon,
  Mail,
  Network,
  Bug,
  Download,
  FileText,
  Play,
  Info,
  Check,
  Settings2,
  BookOpen,
  Heart,
  Share2,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  MessageSquare,
  Send,
  User,
  LogOut,
  LogIn,
  AlertCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  Gift,
  GitPullRequest,
  Wand2,
  Shield,
  CreditCard,
  Key,
  Smartphone,
  Cpu,
  Globe,
  CheckCircle2,
  XCircle,
  Star,
  ShieldCheck,
  Lock as LockIcon,
} from 'lucide-react';

import { 
  MarkdownH2,
  MarkdownPre,
  MarkdownA,
  MarkdownCode,
  MarkdownTable,
  MarkdownThead,
  MarkdownTh,
  MarkdownTd,
  MarkdownTr,
  extractMermaid,
  removeMermaid,
  parsePhases
} from './components/MarkdownComponents';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { CookieConsent } from './components/CookieConsent';
import { AdBlockerModal } from './components/AdBlockerModal';
import { Blog } from './components/Blog';
import { FixModePrompt } from './components/FixModePrompt';
import { FixPromptModal } from './components/FixPromptModal';
import { AboutModal } from './components/AboutModal';
import { DonationModal } from './components/DonationModal';
import { FeedbackModal } from './components/FeedbackModal';
import { TermsModal } from './components/TermsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { CookieModal } from './components/CookieModal';
import { PRModal } from './components/PRModal';
import { ClearHistoryModal } from './components/ClearHistoryModal';
import { Comments } from './components/Comments';
import { FEATURES, DOC_PHASE_INDICES } from './constants';
import { generatePDF } from './utils/pdfExport';
import { generateMarkdown, downloadMarkdown } from './utils/markdownExport';
import { PopupAd } from './components/PopupAd';
import { AdBanner } from './components/AdBanner';
import { fetchWithTimeout, GitHubRateLimitError, parseGitHubUrl } from './services/github';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { AnalysisResult, AnalysisDepth } from './types';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

import { DiffView } from './components/DiffView';

export default function App() {
  const [url, setUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const repoParam = params.get('repo');
      if (repoParam) {
        return `https://github.com/${repoParam}`;
      }
    }
    return localStorage.getItem('repoAnalyzerUrl') || '';
  });
  const [loading, setLoading] = useState(() => {
    return localStorage.getItem('repoAnalyzerLoading') === 'true';
  });
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [showAnalysisLogs, setShowAnalysisLogs] = useState(false);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (loading && url && !currentAnalysis) {
      // If we reloaded while loading was true, restart the analysis
      executeAnalysis(url);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && analysisStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - analysisStartTime) / 1000);
        setElapsedTime(elapsed);
        
        // Calculate estimated time remaining
        if (analysisProgress > 0 && elapsed > 5) {
          const totalEstimatedTime = (elapsed / analysisProgress) * 100;
          const remaining = Math.max(0, Math.round(totalEstimatedTime - elapsed));
          setEstimatedTimeRemaining(remaining);
        }
      }, 1000);
    } else {
      setElapsedTime(0);
      setEstimatedTimeRemaining(null);
    }
    return () => clearInterval(interval);
  }, [loading, analysisStartTime, analysisProgress]);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(() => {
    const saved = localStorage.getItem('repoAnalyzerCurrentAnalysis');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentAnalysis) {
      localStorage.setItem('repoAnalyzerCurrentAnalysis', JSON.stringify(currentAnalysis));
    } else {
      localStorage.removeItem('repoAnalyzerCurrentAnalysis');
    }
  }, [currentAnalysis]);
  const [view, setView] = useState<'analysis' | 'terms' | 'privacy'>('analysis');
  const [compareAnalysis, setCompareAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>(() => {
    const saved = localStorage.getItem('repoAnalyzerHistory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse history from localStorage', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('repoAnalyzerHistory', JSON.stringify(history));
  }, [history]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const parsedPhases = useMemo(() => {
    if (!currentAnalysis) return [];
    return parsePhases(currentAnalysis.markdown);
  }, [currentAnalysis]);
  
  // Auth & Subscription State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [expandedRepos, setExpandedRepos] = useState<Record<string, boolean>>({});
  
  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [showInstructionPopup, setShowInstructionPopup] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>(() => {
    return (localStorage.getItem('repoAnalyzerDepth') as AnalysisDepth) || 'standard';
  });

  useEffect(() => {
    localStorage.setItem('repoAnalyzerUrl', url);
  }, [url]);

  useEffect(() => {
    localStorage.setItem('repoAnalyzerDepth', analysisDepth);
  }, [analysisDepth]);
  const [isSummarizingChat, setIsSummarizingChat] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [showAdBlockModal, setShowAdBlockModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(() => {
    return localStorage.getItem('repoAnalyzerCookiesAccepted') === 'true';
  });
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [popupAdText, setPopupAdText] = useState("Special Offer!");
  const [isFixMode, setIsFixMode] = useState(false);
  const [categoryScores, setCategoryScores] = useState<Record<string, number> | null>(null);
  const [isGlowing, setIsGlowing] = useState(true);
  const [selectedFindings, setSelectedFindings] = useState<string[]>([]);
  const [fixDiff, setFixDiff] = useState<string | null>(null);
  const [isGeneratingFix, setIsGeneratingFix] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showPRCommands, setShowPRCommands] = useState(false);
  const [prConfig, setPrConfig] = useState({ title: '', body: '', branch: 'fix/repo-analyzer-suggestions' });
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [findings, setFindings] = useState<string[]>([]);
  const [showFixPrompt, setShowFixPrompt] = useState(false);
  const [fixedFiles, setFixedFiles] = useState<Record<string, string>>({});
  const [isCommentsInView, setIsCommentsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCommentsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      observer.observe(commentsSection);
    }

    return () => {
      if (commentsSection) {
        observer.unobserve(commentsSection);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGlowing(false);
    }, 10000); // 10 seconds for testing
    
    // Periodic pop-up ads
    const adInterval = setInterval(() => {
      const adTexts = [
        "Special Developer Offer!",
        "Upgrade Your Workflow",
        "Exclusive AI Insights",
        "Developer Tools Discount",
        "Premium Sponsor Content"
      ];
      setPopupAdText(adTexts[Math.floor(Math.random() * adTexts.length)]);
      setShowPopupAd(true);
    }, 45000); // Every 45 seconds

    return () => {
      clearTimeout(timer);
      clearInterval(adInterval);
    };
  }, []);
  
  useEffect(() => {
    setFindings([]);
    setSelectedFindings([]);
    setFixDiff(null);
    setIsFixMode(false);
  }, [currentAnalysis?.id]);

  useEffect(() => {
    if (isFixMode && currentAnalysis && findings.length === 0) {
      console.log("Analysis Markdown:", currentAnalysis.markdown);
      // Extract findings from markdown
      const lines = currentAnalysis.markdown.split('\n');
      const extracted: string[] = [];
      let currentFinding = '';
      
      lines.forEach(line => {
        const trimmed = line.trim();
        // More robust extraction: headers, checkboxes, table rows, or long list items
        if (trimmed.startsWith('### ') || 
            trimmed.startsWith('#### ') || 
            trimmed.startsWith('- [ ]') || 
            trimmed.startsWith('- [x]') || 
            (trimmed.startsWith('|') && trimmed.includes('|', 1)) ||
            (trimmed.startsWith('- ') && trimmed.length > 30)) {
          if (currentFinding) extracted.push(currentFinding.trim());
          currentFinding = line;
        } else if (currentFinding) {
          currentFinding += '\n' + line;
        }
      });
      if (currentFinding) extracted.push(currentFinding.trim());
      
      const filtered = extracted.filter(f => f.length > 10);
      setFindings(filtered); // Extract all findings
      setSelectedFindings(filtered); // Auto-select all findings by default
    }
  }, [isFixMode, currentAnalysis, findings.length]);

  const generateFix = async () => {
    if (!currentAnalysis) return null;
    
    // If no findings selected, try to use all findings. If still none, use a generic prompt.
    const findingsToFix = selectedFindings.length > 0 ? selectedFindings : findings;
    
    setIsGeneratingFix(true);
    const toastId = toast.loading('AI is analyzing the repository to generate fixes...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are a world-class senior software engineer and security expert.
Based on the following analysis findings for the repository ${currentAnalysis.url}:
${findingsToFix.length > 0 ? findingsToFix.join('\n') : 'Perform a comprehensive fix of the most critical security and architectural issues identified in the repository.'}

Your task is to generate a set of surgical, production-ready code fixes.
CRITICAL: You MUST return a JSON object where keys are file paths and values are the NEW content of those files.
DO NOT return diffs. Return the FULL content of the files you want to update.
ONLY return the JSON block.

Example:
{
  "src/App.tsx": "...",
  "package.json": "..."
}

Repository URL: ${currentAnalysis.url}
Analysis Report:
${currentAnalysis.markdown.substring(0, 5000)}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });
      
      const responseText = response.text || '';
      
      // Extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");
      
      const fixedFiles: Record<string, string> = JSON.parse(jsonMatch[0]);
      setFixedFiles(fixedFiles);
      
      // Generate a summary diff for display
      let summaryDiff = "### AI Generated Fixes Summary\n\n";
      Object.keys(fixedFiles).forEach(path => {
        summaryDiff += `- **Fixed:** \`${path}\`\n`;
      });
      summaryDiff += "\n---\n\n";
      summaryDiff += "The AI has generated updated versions of the files listed above. You can now download the updated repository as a ZIP file or copy the patch details.";
      
      setFixDiff(summaryDiff);
      toast.success('Fixes generated successfully!', { id: toastId });
      return fixedFiles;
    } catch (error) {
      console.error("Fix generation failed:", error);
      toast.error('Failed to generate fixes. Please try again.', { id: toastId });
      return null;
    } finally {
      setIsGeneratingFix(false);
    }
  };

  const [isDownloadingRepo, setIsDownloadingRepo] = useState(false);

  useEffect(() => {
    if (loading || isGeneratingFix || isDownloadingRepo) {
      document.body.classList.add('is-analyzing');
    } else {
      document.body.classList.remove('is-analyzing');
    }
  }, [loading, isGeneratingFix, isDownloadingRepo]);

  const downloadUpdatedRepo = async (filesToApply?: Record<string, string>) => {
    const files = filesToApply || fixedFiles;
    if (!currentAnalysis || Object.keys(files).length === 0) return;
    setIsDownloadingRepo(true);
    const toastId = toast.loading('Preparing updated repository...');
    try {
      const repoInfo = parseGitHubUrl(currentAnalysis.url);
      if (!repoInfo) throw new Error('Invalid GitHub URL');

      // Fetch the default branch
      const repoRes = await fetchWithTimeout(`/api/proxy/github/repos/${repoInfo.owner}/${repoInfo.repo}`);
      if (!repoRes.ok) {
        if (repoRes.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`Failed to fetch repository info: ${repoRes.statusText}`);
      }
      const repoData = await repoRes.json();
      const defaultBranch = repoData.default_branch;

      // Fetch the zipball
      toast.loading('Downloading repository zip...', { id: toastId });
      const zipRes = await fetchWithTimeout(`/api/proxy/github-zip?owner=${repoInfo.owner}&repo=${repoInfo.repo}&branch=${defaultBranch}`);
      if (!zipRes.ok) {
        throw new Error(`Failed to download repository zip: ${zipRes.statusText}`);
      }
      const zipBlob = await zipRes.blob();

      // Load the zip with JSZip
      toast.loading('Applying fixes to zip...', { id: toastId });
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(zipBlob);

      // Find the root folder name inside the zip (GitHub adds a wrapper folder)
      const rootFolderName = Object.keys(loadedZip.files).find(name => name.endsWith('/') && name.split('/').length === 2);
      
      if (!rootFolderName) throw new Error('Could not determine root folder in zip');

      // Apply the fixes
      Object.entries(files).forEach(([filename, content]) => {
        // Ensure the filename doesn't start with a slash
        const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
        const fullPath = `${rootFolderName}${cleanFilename}`;
        
        // Add or update the file in the zip
        loadedZip.file(fullPath, content);
      });

      // Generate the new zip and download it
      toast.loading('Generating final zip...', { id: toastId });
      const newZipBlob = await loadedZip.generateAsync({ type: 'blob' });
      saveAs(newZipBlob, `${repoInfo.repo}-updated.zip`);
      toast.success('Updated repository downloaded!', { id: toastId });

    } catch (error: any) {
      console.error('Error downloading updated repo:', error);
      const errorMessage = error.message || 'Failed to download updated repository.';
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsDownloadingRepo(false);
    }
  };

  // Ad blocker detection
  useEffect(() => {
    const checkAdBlock = async () => {
      try {
        const url = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        setAdBlockDetected(false);
      } catch (e) {
        setAdBlockDetected(true);
        setShowAdBlockModal(true);
      }
    };
    checkAdBlock();
    
    // Secondary check
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    document.body.appendChild(testAd);
    window.setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        setAdBlockDetected(true);
        setShowAdBlockModal(true);
      }
      testAd.remove();
    }, 100);
  }, []);

  // Load history and config on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('repo_analysis_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }

    const savedHistory = localStorage.getItem('repo_analysis_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('repo_analysis_history', JSON.stringify(history));
  }, [history]);

  // Apply theme
  useEffect(() => {
    localStorage.setItem('repo_analysis_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Update document title and meta tags for SEO dynamically
  useEffect(() => {
    if (currentAnalysis) {
      const title = `${currentAnalysis.repoName} Analysis & Code Review | GitRepoAnalyzer`;
      const desc = `AI-powered architectural analysis, security review, and automated code fixes for ${currentAnalysis.repoName}.`;
      document.title = title;
      document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
      document.querySelector('meta[property="twitter:title"]')?.setAttribute('content', title);
      document.querySelector('meta[property="twitter:description"]')?.setAttribute('content', desc);
      
      // Update URL parameter for shareability
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('repo', currentAnalysis.repoName);
      window.history.replaceState({}, '', newUrl);
    } else {
      const title = 'GitRepoAnalyzer | AI-Powered GitHub Repository Analysis & Code Fixes';
      const desc = 'Instantly analyze GitHub repositories with AI. Get deep architectural insights, security reviews, automated code fixes, and generate comprehensive project documentation.';
      document.title = title;
      document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
      document.querySelector('meta[property="twitter:title"]')?.setAttribute('content', title);
      document.querySelector('meta[property="twitter:description"]')?.setAttribute('content', desc);
      
      // Remove URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('repo');
      window.history.replaceState({}, '', newUrl);
    }
  }, [currentAnalysis]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const extractRepoInfo = (inputUrl: string) => {
    try {
      const urlObj = new URL(inputUrl);
      if (urlObj.hostname !== 'github.com') return null;
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length < 2) return null;
      return { owner: parts[0], repo: parts[1] };
    } catch {
      return null;
    }
  };

  const validateGitHubUrl = (inputUrl: string): boolean => {
    const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
    return githubUrlRegex.test(inputUrl);
  };

  const summarizeChat = async () => {
    if (chatMessages.length < 2 || isSummarizingChat) return;
    setIsSummarizingChat(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });
      
      const chatHistory = chatMessages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n\n');
      const summaryPrompt = `
Summarize the following conversation between a user and an AI repository analyzer. 
Provide a concise, professional overview of the key topics discussed, any issues identified, and the main conclusions reached.
Keep the summary under 150 words and use a clear, structured format.

--- CONVERSATION HISTORY ---
${chatHistory}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: summaryPrompt,
      });

      const summaryText = response.text || 'Could not generate summary.';
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: `📝 **CONVERSATION SUMMARY**\n\n${summaryText}\n\n---` 
      }]);
    } catch (err) {
      console.error("Summarization Error:", err);
    } finally {
      setIsSummarizingChat(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentAnalysis) return;

    const userMessage = chatInput.trim();
    
    const isCode = userMessage.includes('```') || userMessage.includes('function ') || userMessage.includes('const ') || userMessage.includes('import ') || userMessage.includes('class ');
    
    const promptPrefix = isCode 
      ? "The user has provided a code snippet for analysis. Act as an elite AI coding assistant. Analyze the code deeply, suggest concrete improvements, explain its functionality step-by-step, and identify any potential bugs, security issues, or performance bottlenecks. Provide refactored code if applicable.\n\n"
      : "";

    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });

      const contextPrompt = `
You are GitRepoAnalyzer AI, an elite software architect, security auditor, and senior developer who has deeply analyzed the following repository: ${currentAnalysis.repoName}.
You have memorized its entire codebase, architecture, and every single feature based on this comprehensive analysis:

--- START ANALYSIS ---
${currentAnalysis.markdown}
--- END ANALYSIS ---

The user is asking a question or providing code related to this repository. Answer it accurately, deeply, and comprehensively.
If they provide code, analyze it point-by-point, highlight issues, and provide graphical representations (like Mermaid flowcharts) if it helps explain complex logic.
Be extremely advanced, mindful, and neat. Frame your responses accurately, point-by-point, and highlight key takeaways.

User Input: ${promptPrefix}${userMessage}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: contextPrompt,
      });

      setChatMessages(prev => [...prev, { role: 'model', text: response.text || 'No response generated.' }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setChatMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };
  const handleAnalyzeClick = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateGitHubUrl(url)) {
      return;
    }

    const repoInfo = extractRepoInfo(url);
    if (!repoInfo) {
      setError('Could not extract repository information. Please check the URL.');
      return;
    }

    setError(null);
    setShowInstructionPopup(true);
  };

  const handleConfirmInstruction = async () => {
    setShowInstructionPopup(false);
    setIsConfiguring(true);
  };

  const executeAnalysis = async (targetUrl: string) => {
      console.log("Executing analysis for:", targetUrl);
      const repoInfo = extractRepoInfo(targetUrl);
      if (!repoInfo) {
        console.error("Invalid repository URL:", targetUrl);
        setError("Invalid repository URL. Please check the URL and try again.");
        return;
      }
      
      setLoading(true);
      localStorage.setItem('repoAnalyzerLoading', 'true');

      setAnalysisStartTime(Date.now());
      setIsConfiguring(false);
      setAnalysisProgress(2);
      setAnalysisStep('Initializing analysis pipeline...');
      setAnalysisLogs(['[SYSTEM] Initializing analysis pipeline...', `[SYSTEM] Target: ${targetUrl}`]);
      setIsSidebarOpen(false); // Close sidebar on mobile when analyzing

      const addLog = (msg: string) => {
        setAnalysisLogs(prev => [...prev.slice(-199), `[${new Date().toLocaleTimeString()}] ${msg}`]);
      };

      const updateProgress = (progress: number, step: string, estRemaining?: number) => {
        setAnalysisProgress(progress);
        setAnalysisStep(step);
        if (estRemaining !== undefined) setEstimatedTimeRemaining(estRemaining);
        addLog(step);

        // Trigger random pop-up ads during analysis
        if (Math.random() > 0.7) {
          setPopupAdText(`Analysis Phase: ${step}`);
          setShowPopupAd(true);
        }
      };

      // Helper for simulated progress during long tasks
      let progressInterval: any = null;
      const startSimulatedProgress = (start: number, end: number, durationMs: number) => {
        if (progressInterval) clearInterval(progressInterval);
        const steps = 50;
        const increment = (end - start) / steps;
        const stepTime = durationMs / steps;
        let current = start;
        progressInterval = setInterval(() => {
          current += increment;
          if (current >= end) {
            clearInterval(progressInterval);
          } else {
            setAnalysisProgress(Math.floor(current));
          }
        }, stepTime);
      };

      const stopSimulatedProgress = () => {
        if (progressInterval) clearInterval(progressInterval);
      };

      try {
        // 1. Fetch Repo Metadata
        updateProgress(5, 'Fetching repository metadata from GitHub API...', analysisDepth === 'quick' ? 30 : analysisDepth === 'standard' ? 60 : 120);
        addLog('Deep Process: Connecting to GitHub REST API v3...');
        
        const repoRes = await fetchWithTimeout(`/api/proxy/github/repos/${repoInfo.owner}/${repoInfo.repo}`);
        if (!repoRes.ok) {
          if (repoRes.status === 404) {
            throw new Error('GitHub repository not found. Please check the URL or ensure the repository is public.');
          } else if (repoRes.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
          } else if (repoRes.status >= 500) {
            throw new Error('GitHub is currently experiencing server issues. Please try again later.');
          } else {
            throw new Error(`GitHub API error: ${repoRes.status} ${repoRes.statusText}`);
          }
        }
        const repoData = await repoRes.json();
        addLog(`Repository identified: ${repoData.full_name} (${repoData.stargazers_count} stars)`);
        addLog(`Deep Process: Primary language: ${repoData.language || 'Unknown'}. Default branch: ${repoData.default_branch || 'main'}`);
        const defaultBranch = repoData.default_branch || 'main';

        updateProgress(10, 'Reading repository tree and recursive structure...', analysisDepth === 'quick' ? 25 : analysisDepth === 'standard' ? 55 : 115);
        addLog(`Deep Process: Accessing default branch: ${defaultBranch}...`);
        
        // 2. Fetch File Tree
        addLog('Deep Process: Fetching full file tree recursively (recursive=1)...');
        startSimulatedProgress(10, 15, 2000);
        const treeRes = await fetchWithTimeout(`/api/proxy/github/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${defaultBranch}?recursive=1`);
        stopSimulatedProgress();
        
        let treeData: any = { tree: [] };
        if (treeRes.ok) {
          treeData = await treeRes.json();
          addLog(`Successfully retrieved ${treeData.tree.length} files from git tree.`);
        } else {
          addLog('Warning: Failed to fetch full tree. Falling back to basic file list.');
        }
        
        // Filter out binaries and generated code
        updateProgress(15, 'Filtering files for analysis context and relevance...', analysisDepth === 'quick' ? 20 : analysisDepth === 'standard' ? 50 : 110);
        addLog('Deep Process: Identifying source files, skipping binaries, lockfiles, and node_modules...');
        
        const excludedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip', '.gz', '.tar', '.exe', '.bin', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.wav', '.lock', '.sum', '.map'];
        const excludedPaths = ['node_modules/', 'vendor/', 'dist/', 'build/', 'out/', 'target/', '.git/', '.idea/', '.vscode/', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock', 'go.sum', 'Cargo.lock', 'gradle/', '.gradle/', 'bower_components/', 'tmp/', 'logs/'];
        
        const filteredFiles = treeData.tree.filter((item: any) => {
          if (item.type !== 'blob') return false;
          const path = item.path.toLowerCase();
          if (excludedExtensions.some(ext => path.endsWith(ext))) return false;
          if (excludedPaths.some(p => path.includes(p))) return false;
          // Skip large files (over 500KB for analysis context)
          if (item.size && item.size > 500000) return false; 
          return true;
        });
        addLog(`Filtered down to ${filteredFiles.length} relevant source files for deep analysis.`);

        setAnalysisProgress(20);
        const allFiles = filteredFiles.map((item: any) => item.path);
        const allFilesSet = new Set(allFiles);
        const fileTreeStr = filteredFiles.slice(0, 500).map((item: any) => {
          const sizeKB = item.size ? (item.size / 1024).toFixed(1) + ' KB' : 'Unknown size';
          return `${item.path} (${sizeKB})`;
        }).join('\n') + (filteredFiles.length > 500 ? '\n...and more' : '');

        updateProgress(25, 'Identifying recently changed files and commit patterns...', analysisDepth === 'quick' ? 15 : analysisDepth === 'standard' ? 45 : 105);
        addLog('Deep Process: Analyzing commit history to identify hot spots and recent changes...');
        
        const recentFiles = new Set<string>();
        try {
          const commitCount = analysisDepth === 'quick' ? 5 : analysisDepth === 'standard' ? 10 : 20;
          const commitsRes = await fetchWithTimeout(`/api/proxy/github/repos/${repoInfo.owner}/${repoInfo.repo}/commits?per_page=${commitCount}`);
          if (commitsRes.ok) {
            const commitsData = await commitsRes.json();
            addLog(`Retrieved last ${commitsData.length} commits for pattern analysis.`);
            if (commitsData.length > 0) {
              const headSha = commitsData[0].sha;
              const baseSha = commitsData[commitsData.length - 1].sha;
              
              addLog(`Deep Process: Comparing diff between ${baseSha.substring(0, 7)} and ${headSha.substring(0, 7)}...`);
              const compareRes = await fetchWithTimeout(`/api/proxy/github/repos/${repoInfo.owner}/${repoInfo.repo}/compare/${baseSha}...${headSha}`);
              if (compareRes.ok) {
                const compareData = await compareRes.json();
                compareData.files?.forEach((f: any) => {
                  if (allFilesSet.has(f.filename)) recentFiles.add(f.filename);
                });
                addLog(`Identified ${recentFiles.size} recently modified files.`);
              }
            }
          }
        } catch (e) {
          addLog('Warning: Failed to fetch recent files from commits.');
        }

        updateProgress(30, 'Prioritizing key files and core logic components...', analysisDepth === 'quick' ? 10 : analysisDepth === 'standard' ? 40 : 100);
        addLog('Deep Process: Scanning for entry points, configuration files, and core business logic...');

      // 3. Fetch Key Files (README + important config/source files)
      const keyFilePatterns = [
        /^README\.md$/i,
        /^LICENSE(\.md|\.txt)?$/i,
        /^CONTRIBUTING(\.md)?$/i,
        /^CODE_OF_CONDUCT(\.md)?$/i,
        /^package\.json$/,
        /^requirements\.txt$/,
        /^go\.mod$/,
        /^Cargo\.toml$/,
        /^docker-compose\.yml$/,
        /^Dockerfile$/,
        /^src\/(index|main|App|server|routes|app)\.(tsx|ts|jsx|js)$/,
        /^(main|app|server|index)\.(py|js|ts|go|rs)$/,
        /^lib\/(main|app)\.(dart)$/,
        /^(config|settings)\.(json|yml|yaml|js|ts)$/,
        /^src\/components\/.*?\.(tsx|jsx)$/,
        /^src\/pages\/.*?\.(tsx|jsx)$/,
        /^(tests?|__tests?__)\/.*?\.(ts|js|py|go|rs)$/,
        /^(docs?)\/.*?\.(md|mdx)$/,
        /\.env\.example$/,
        /tsconfig\.json$/,
        /vite\.config\.(js|ts)$/,
        /next\.config\.(js|ts|mjs)$/,
        /tailwind\.config\.(js|ts)$/,
        /webpack\.config\.js$/,
        /\.gitignore$/
      ];

      const keyFiles = allFiles.filter((path: string) => 
        keyFilePatterns.some(pattern => pattern.test(path))
      );

      // For deep analysis, identify "complex" or "core" files
      const complexFiles: string[] = [];
      if (analysisDepth === 'deep') {
        addLog('Deep Analysis Mode: Identifying complex core logic files...');
        const complexPatterns = [
          /core/i, /engine/i, /logic/i, /service/i, /api/i, /auth/i, /db/i, /database/i, /util/i, /helper/i, /common/i, /shared/i, /store/i, /context/i, /reducer/i, /action/i, /hook/i, /controller/i, /model/i, /view/i, /middleware/i, /provider/i, /manager/i, /handler/i, /processor/i, /parser/i, /lexer/i, /compiler/i, /interpreter/i, /executor/i, /runner/i, /worker/i, /job/i, /task/i, /queue/i, /bus/i, /event/i, /message/i, /stream/i, /observable/i, /subject/i, /subscription/i, /observer/i, /factory/i, /singleton/i, /strategy/i, /decorator/i, /proxy/i, /adapter/i, /facade/i, /bridge/i, /composite/i, /flyweight/i, /iterator/i, /mediator/i, /memento/i, /state/i, /template/i, /visitor/i, /command/i, /chain/i, /responsibility/i
        ];
        
        // Find files that match complex patterns and are reasonably sized (not too small, not too large)
        filteredFiles.forEach((item: any) => {
          const path = item.path;
          if (complexPatterns.some(p => p.test(path)) && item.size > 2000 && item.size < 400000) {
            complexFiles.push(path);
          }
        });
        
        // Sort by size descending to get potentially more complex files first
        complexFiles.sort((a, b) => {
          const sizeA = filteredFiles.find(f => f.path === a)?.size || 0;
          const sizeB = filteredFiles.find(f => f.path === b)?.size || 0;
          return sizeB - sizeA;
        });
      }

      // Combine and prioritize: Recent files first, then key files, then complex files, then others
      const prioritizedFiles = Array.from(new Set([
        ...Array.from(recentFiles), 
        ...keyFiles,
        ...complexFiles
      ]));
      
      const limit = analysisDepth === 'quick' ? 10 : analysisDepth === 'standard' ? 20 : 30;
      let filesToFetch = prioritizedFiles.slice(0, limit);

      // If we still have space, add some other files from allFiles that are not already included
      if (filesToFetch.length < limit) {
        const remaining = allFiles.filter(f => !filesToFetch.includes(f));
        filesToFetch.push(...remaining.slice(0, limit - filesToFetch.length));
      }

      // Always try to fetch README if not in the list and it exists
      if (!filesToFetch.some((p: string) => p.toLowerCase() === 'readme.md') && allFilesSet.has('README.md')) {
        filesToFetch = ['README.md', ...filesToFetch.slice(0, limit - 1)];
      } else if (!filesToFetch.some((p: string) => p.toLowerCase() === 'readme.md')) {
        // Find any case variation of README.md
        const readmePath = allFiles.find(p => p.toLowerCase() === 'readme.md');
        if (readmePath) {
          filesToFetch = [readmePath, ...filesToFetch.slice(0, limit - 1)];
        }
      }

      updateProgress(40, `Fetching content for ${filesToFetch.length} selected files...`, analysisDepth === 'quick' ? 8 : analysisDepth === 'standard' ? 35 : 95);
      let fileContents = '';
      let fetchedCount = 0;
      addLog('Deep Process: Initializing parallel fetch pipeline for source content...');
      
      for (const filePath of filesToFetch) {
        try {
          addLog(`Deep Process: Fetching content: ${filePath}...`);
          const fileRes = await fetch(`/api/proxy/github/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}?ref=${defaultBranch}`, {
            headers: { "Accept": "application/vnd.github.v3.raw" }
          });
          if (fileRes.ok) {
            const content = await fileRes.text();
            fileContents += `\n\n--- FILE: ${filePath} ---\n${content.substring(0, 6000)}`; // Reduced limit to 6k chars per file to prevent XHR payload too large errors
            fetchedCount++;
            const fetchProgress = 40 + (fetchedCount / filesToFetch.length) * 15;
            setAnalysisProgress(Math.floor(fetchProgress));
            setEstimatedTimeRemaining(Math.max(0, (analysisDepth === 'quick' ? 5 : analysisDepth === 'standard' ? 30 : 90) - (fetchedCount / filesToFetch.length) * 10));
          }
        } catch (e) {
          addLog(`Warning: Failed to fetch ${filePath}`);
        }
      }
      addLog(`Successfully fetched content for ${fetchedCount} files. Total context size: ${Math.round(fileContents.length / 1024)} KB`);

      updateProgress(55, 'Fetching detailed commit history for context...', analysisDepth === 'quick' ? 5 : analysisDepth === 'standard' ? 25 : 85);
      addLog('Deep Process: Retrieving detailed commit history for context analysis...');
      
      let commitHistoryStr = '';
      try {
        const commitsRes = await fetch(`/api/proxy/github/repos/${repoInfo.owner}/${repoInfo.repo}/commits?per_page=10`);
        if (commitsRes.ok) {
          const commitsData = await commitsRes.json();
          commitHistoryStr = commitsData.map((c: any) => `- ${c.commit.author.date}: ${c.commit.message.split('\n')[0]}`).join('\n');
        }
      } catch (e) {
        addLog('Warning: Failed to fetch detailed commit history.');
      }

      updateProgress(60, 'Preparing comprehensive AI analysis prompt...', analysisDepth === 'quick' ? 3 : analysisDepth === 'standard' ? 20 : 80);
      addLog('Deep Process: Constructing comprehensive analysis prompt for Gemini 3.1 Pro...');
      addLog('Deep Process: Injecting repository metadata, file tree, and source content into context window...');

      // 4. Generate Analysis with Gemini
      let prompt = `
You are a world-class Software Architect, Security Engineer, and AI Code Analyst combined.
Your task is to analyze the following GitHub repository deeply and produce a COMPLETE, EVIDENCE-BASED, ACTIONABLE transformation report.

You MUST follow a strict multi-phase execution pipeline. Do NOT skip steps. Do NOT hallucinate. Every claim must be grounded in actual code evidence (file paths, function names, or patterns).

**ANALYSIS DEPTH:** ${analysisDepth === 'quick' ? 'Quick Scan (High-level overview, focus on core purpose and main components)' : analysisDepth === 'standard' ? 'Standard (Balanced analysis, covering architecture, security, and key logic)' : 'Deep Dive (Exhaustive, line-by-line scrutiny, tracing every call flow and identifying every minor inefficiency)'}

Repository URL: ${url}
Name: ${repoData.full_name}
Description: ${repoData.description || 'No description provided.'}
Primary Language: ${repoData.language || 'Unknown'}
Stars: ${repoData.stargazers_count}
Forks: ${repoData.forks_count}

RECENT COMMIT HISTORY (Top 10):
${commitHistoryStr || 'Not available'}

FILE TREE (Top 500 files):
${fileTreeStr}

KEY FILE CONTENTS:
${fileContents}

Please provide a highly detailed, professional report formatted in Markdown following this 16-phase structure.
CRITICAL: You MUST include ALL 16 phases (0 to 15). Do not skip any.
CRITICAL: You MUST use the exact headings below (e.g., "# PHASE 0: INPUT UNDERSTANDING").
CRITICAL: At the end of each phase, you MUST include a score out of 10 points formatted exactly as: "**Phase Score: X/10**" (if applicable, otherwise omit).

# PHASE 0: INPUT UNDERSTANDING & CORE PURPOSE
- Parse repository structure
- Identify:
  - Languages used
  - Frameworks/libraries
  - Entry points (main files)
  - Config files (package.json, requirements.txt, Dockerfile, etc.)
- Build a mental map before analysis

OUTPUT:
- **Tech Stack Summary:** Detailed list of all technologies, frameworks, and tools identified.
- **Entry Points:** Clear identification of main files and entry points.
- **Core Purpose & Use Case:** A detailed explanation of the application's primary purpose, its target audience, and the specific problems it solves. Be as descriptive as possible based on the evidence.
- **High-level repo purpose:** A concise summary of the repository's role in the larger ecosystem.
- **File Tree Analysis:** A brief analysis of the file tree, including file sizes to give a better sense of the codebase's scale.
**Phase Score: X/10**

# PHASE 1: ARCHITECTURE RECONSTRUCTION
Reconstruct the architecture WITHOUT assumptions.
- Identify:
  - Modules/services
  - Data flow between components
  - API layers
  - Database interactions
  - External dependencies
- Detect patterns:
  - MVC / Microservices / Monolith / Event-driven
  - State management approach
  - Communication patterns (REST, WebSocket, etc.)

OUTPUT:
1. Architecture Explanation (clear, human-readable)
2. Mermaid Diagram (STRICT syntax, no errors, use flowchart TD)
   - **CRITICAL: Complex & Detailed:** Create a highly detailed, complex diagram. Include all major components, services, modules, data flows, API interactions, state management, external dependencies, databases, and third-party integrations. Use subgraphs to group related components logically. Make it as advanced and dynamic as possible to show the full context of the application.
   - **CRITICAL: Visual Distinction:** Use different node shapes and colors (using \`classDef\` or \`style\`) to visually distinguish between different types of components (e.g., databases in blue cylinders, frontend in green rectangles, external APIs in purple).
   - **CRITICAL: Interactivity:** For EVERY node in the diagram, add a click event using the exact syntax: \`click NodeID href "#node-NodeID" "View Details"\`.
3. Component Breakdown:
   - Component Name
   - Responsibility
   - Key Files (with paths)
4. **CRITICAL: Node Details JSON:** Immediately after the mermaid code block, you MUST provide a JSON block enclosed in \`\`\`json ... \`\`\` containing detailed explanations for each node. The JSON should be an object where keys are the NodeIDs and values are the detailed explanations (including related code snippets, file paths, and what the component does).
**Phase Score: X/10**

# PHASE 2: CODE QUALITY & COMPLEXITY
Analyze maintainability and structure:
- Identify:
  - Large/complex files
  - Duplicate logic
  - Poor naming
  - Tight coupling
  - Dead code
- Detect:
  - Code smells
  - Violations of SOLID principles

OUTPUT:
- All Identified Issues (ranked by impact)
- Refactoring Suggestions (file-level)
- Complexity hotspots (with file references)
**Phase Score: X/10**

# PHASE 3: SECURITY ANALYSIS (STRICT)
Perform a practical security audit:
CHECK:
- Hardcoded secrets
- Unsafe input handling
- Authentication/authorization gaps
- Dependency vulnerabilities (based on versions)
- Injection risks (SQL, command, etc.)
- Insecure APIs
RULE:
- Every issue MUST include:
  - File path
  - Code reference (line or snippet)
  - Severity (Low/Medium/High/Critical)
  - Why it is risky

OUTPUT:
- Security Findings Table
- Fix Recommendations (practical, not theoretical)
**Phase Score: X/10**

# PHASE 4: PERFORMANCE ANALYSIS
Identify bottlenecks:
- Inefficient loops
- Redundant API/database calls
- Blocking operations
- Memory-heavy operations

OUTPUT:
- Bottlenecks with file references
- Optimization strategies
**Phase Score: X/10**

# PHASE 5: SCALABILITY REVIEW
Evaluate production readiness:
- Can this scale?
- Identify:
  - Single points of failure
  - Stateless vs stateful issues
  - Missing caching
  - Missing queues

OUTPUT:
- Scalability Score (1–10)
- Scaling roadmap
**Phase Score: X/10**

# PHASE 6: TESTING & RELIABILITY
- Detect presence of:
  - Unit tests
  - Integration tests
  - Error handling patterns

OUTPUT:
- Test Coverage Estimate
- Missing critical tests
- Reliability risks
**Phase Score: X/10**

# PHASE 7: DX (Developer Experience)
Evaluate developer friendliness:
- Setup complexity
- Documentation clarity
- Code readability
- Onboarding friction

OUTPUT:
- DX Score (1–10)
- Improvements
**Phase Score: X/10**

# PHASE 8: MASTER IMPROVEMENT PLAN
Create a prioritized roadmap:
- SHORT TERM (Quick Wins)
- MID TERM (Structural fixes)
- LONG TERM (Advanced upgrades)
Each item must include:
- What to do
- Where to do (files/modules)
- Expected impact
**Phase Score: X/10**

# PHASE 9: MASTER PROMPT GENERATOR
Generate a reusable AI prompt that can:
- Recreate this project
- Improve this project
- Extend this project
- Detail exactly what is working, what is not, where every call goes, and how to fix every architectural flaw.
- Include specific instructions for adding more granular error handling within the application's components.
**Phase Score: X/10**

# PHASE 10: SETUP & RUN INSTRUCTIONS
Provide exact terminal commands and setup instructions to run this project locally.
- Prerequisites (Node, Python, Docker, etc.)
- **CRITICAL: Provide the exact package download commands for all detected package managers (e.g., \`npm install\`, \`pip install\`, \`composer install\`, \`go mod download\`).**
- **CRITICAL: Provide the exact run commands (e.g., \`npm run dev\`, \`python main.py\`, \`go run .\`).**
- Environment variables setup.
- **CRITICAL: Provide troubleshooting suggestions for common errors during setup or run (e.g., "If you see a module not found error, try running \`npm install\` again or check your node version").**
**Phase Score: X/10**

# PHASE 11: OVERALL AI ADVANCED SMART SUMMARY & FINAL VERDICT
Provide a highly advanced, smart summary of all the phases.
- Synthesize the most critical findings across the entire repository.
- Identify all critical issues in the code of the full repo concisely (do not exceed token limits).
- Give a FINAL VERDICT on the codebase health, technical debt, and production readiness.
- Provide a clear, high-level executive summary for stakeholders.
- Highlight the most significant architectural strengths and weaknesses.
- Suggest the single most important next step for the developers.
**Phase Score: X/10**

# PHASE 12: ANALYTICAL SUMMARY GRAPH & CATEGORY SCORES
Provide a comprehensive summary of the analysis in a structured format that can be visualized as a graph.
- Assign a score out of 100 for each of the following categories:
  - Architecture
  - Code Quality
  - Security
  - Performance
  - Scalability
  - Reliability
  - DX (Developer Experience)
  - Maintainability
  - Documentation
  - Test Coverage
- Provide a brief justification for each score.
- **CRITICAL: Provide a detailed text summary of findings BEFORE the JSON block.**
- **CRITICAL: Include a Mermaid.js pie chart or bar chart visualizing these scores BEFORE the JSON block.**
- **CRITICAL: Format the scores as a JSON block** at the end of this phase using the key "categoryScores".
**Phase Score: X/10**

# PHASE 13: FULL REPOSITORY FILE STRUCTURE & MAPPING
Provide a complete, hierarchical tree view of the entire repository's file structure.
- Map out every directory and file.
- Briefly describe the purpose of each major directory and key files.
- Highlight the entry points and main configuration files.
- Identify the core logic files and their relationships.
- Provide a clear, visual representation of the project's organization.
**Phase Score: X/10**

# PHASE 14: WHAT IT HAS & WHAT IT IS USING
Provide a detailed breakdown of the application's features and dependencies.
- **What it has:** List all major features, components, and capabilities of the application.
- **What it is using:** Detail the libraries, tools, APIs, and external services the application relies on.
- **Remove what is not used:** Identify any unused features, dead code, unnecessary dependencies, or deprecated libraries. Provide a clear description of what should be removed to optimize the project.
**Phase Score: X/10**

# PHASE 15: COMPREHENSIVE USAGE GUIDE, WORKFLOWS & USER EXPERIENCE
Provide a detailed guide on how to use the application.
- **Core Purpose & Value Proposition:** Explain why this application exists and the value it provides to users.
- **Core Workflows:** Describe the primary user journeys and how to complete them. Include step-by-step instructions for key tasks.
- **Key Features Walkthrough:** Detail each major feature and how a user interacts with it. Explain the functionality and benefits of each feature.
- **User Interface Breakdown:** Explain the main screens, navigation, and controls. Describe the visual layout and how users move through the application.
- **API & Integration Guide:** If the app has an API or integrates with other services, explain how to use those integrations. Provide examples of API calls or integration steps.
- **Common Use Cases:** Provide examples of how different types of users might use the application. Describe specific scenarios and how the app addresses them.
- **Troubleshooting & FAQs:** Include common issues users might face and how to resolve them. Provide clear, actionable advice.
- **Getting Started Guide:** A concise, step-by-step guide for new users to get up and running quickly.
**Phase Score: X/10**

-----------------------------------
OUTPUT RULES
-----------------------------------
- Use structured Markdown with a professional, technical tone.
- **CRITICAL: Use Markdown Tables** for comparing data, listing security findings, performance bottlenecks, and scalability roadmaps.
- **CRITICAL: Use Code Blocks with Syntax Highlighting** (e.g., \`\`\`typescript, \`\`\`python) for all code snippets, configuration examples, and terminal commands.
- Use clear sections, sub-sections, and bullet points to organize information logically.
- NO vague statements. Every claim must be supported by evidence from the codebase.
- NO assumptions without evidence. If something is unclear, state "Insufficient evidence".
- Keep explanations clear, technical, and strictly professional.
- Prioritize actionable insights over theoretical discussions.
- Ensure the documentation is comprehensive enough to serve as a standalone technical manual for the repository.

-----------------------------------
CRITICAL RULES
-----------------------------------
- If unsure → say "Insufficient evidence"
- NEVER hallucinate files or functions
- ALWAYS prioritize developer usefulness
- Think like a senior engineer reviewing a real production system
`;

      const modelMap: Record<AnalysisDepth, string> = {
        'quick': 'gemini-3.1-flash-lite-preview',
        'standard': 'gemini-3-flash-preview',
        'deep': 'gemini-3.1-pro-preview'
      };
      const model = modelMap[analysisDepth] || 'gemini-3-flash-preview';

      addLog(`Deep Process: Connecting to ${model} via Google GenAI SDK...`);
      addLog('Deep Process: Awaiting multi-phase architectural reasoning response...');
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContentStream({
        model: model,
        contents: prompt,
      });

      setAnalysisProgress(70);
      setAnalysisStep('Generating AI analysis... (Streaming Deep Reasoning)');
      addLog('Deep Process: AI Analysis started. Receiving streaming response chunks...');

      let markdown = '';
      const analysisId = Date.now().toString();
      const timestamp = Date.now();
      
      setCurrentAnalysis({
        id: analysisId,
        url,
        timestamp,
        repoName: repoData.full_name,
        markdown: '',
        nodeDetails: {},
        fileTree: allFiles,
      });

      let lastPhaseNum = -1;
      for await (const chunk of response) {
        markdown += chunk.text;
        setCurrentAnalysis(prev => prev ? { ...prev, markdown } : null);
        
        // Update analysis step based on current phase
        const phaseMatches = [...markdown.matchAll(/# PHASE (\d+)[:\-] (.*?)\n/g)];
        if (phaseMatches.length > 0) {
          const lastMatch = phaseMatches[phaseMatches.length - 1];
          const phaseNum = parseInt(lastMatch[1], 10);
          const currentPhase = lastMatch[2].trim();
          
            if (phaseNum !== lastPhaseNum) {
              addLog(`Deep Process: Entering Phase ${phaseNum}: ${currentPhase}`);
              lastPhaseNum = phaseNum;
              // Progress from 70 to 98 based on phases (0-13)
              setAnalysisProgress(Math.floor(70 + (phaseNum / 13) * 28));
            }
          
          setAnalysisStep(`Analyzing Phase ${phaseNum}: ${currentPhase}...`);
        }
      }

      setAnalysisProgress(98);
      setAnalysisStep('Finalizing results and generating report...');
      addLog('Deep Process: AI analysis complete. Post-processing response data...');

      // Extract JSON block if present
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
      let match;
      let updatedMarkdown = markdown;
      let extractedNodeDetails: Record<string, string> = {};
      while ((match = jsonRegex.exec(markdown)) !== null) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed.categoryScores) {
            setCategoryScores(parsed.categoryScores);
          } else {
            extractedNodeDetails = { ...extractedNodeDetails, ...parsed };
          }
          // Remove the JSON block from the markdown so it's not rendered
          updatedMarkdown = updatedMarkdown.replace(match[0], '');
        } catch (e) {
          console.error("Failed to parse JSON block", e);
        }
      }
      markdown = updatedMarkdown;

      const finalAnalysis: AnalysisResult = {
        id: analysisId,
        url,
        timestamp,
        repoName: repoData.full_name,
        markdown,
        nodeDetails: extractedNodeDetails,
        categoryScores: categoryScores,
        fileTree: allFiles,
      };

      setAnalysisProgress(100);
      setCurrentAnalysis(finalAnalysis);
      setCompareAnalysis(null);
      setHistory(prev => [finalAnalysis, ...prev].slice(0, 50)); // Keep last 50 versions
      setUrl(''); // Clear input
      addLog('Deep Process: Analysis pipeline successfully finalized. Results are ready.');
    } catch (err: any) {
      console.error("Analysis Error:", err);
      let errorMessage = 'An unexpected error occurred during analysis.';
      
      if (err instanceof GitHubRateLimitError) {
        const resetTime = err.resetAt ? new Date(err.resetAt).toLocaleTimeString() : 'later';
        errorMessage = `GitHub API rate limit exceeded. The limit will reset at ${resetTime}. Please wait or try a different repository.`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
        
        // Enhance Gemini API error messages
        const lowerMsg = err.message.toLowerCase();
        if (lowerMsg.includes('401') || lowerMsg.includes('api key')) {
          errorMessage = 'Invalid Gemini API Key. Please check your configuration.';
        } else if (lowerMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('rate limit')) {
          errorMessage = 'API quota exceeded or rate limited. Please try again later.';
        } else if (lowerMsg.includes('503') || lowerMsg.includes('overloaded')) {
          errorMessage = 'The AI model is currently overloaded. Please try again in a few moments.';
        } else if (lowerMsg.includes('400') || lowerMsg.includes('bad request')) {
          errorMessage = 'The AI model rejected the request. The repository content might be too large or contain unsupported characters.';
        } else if (lowerMsg.includes('fetch') || lowerMsg.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      localStorage.setItem('repoAnalyzerLoading', 'false');
      setAnalysisProgress(0);
      setAnalysisStep('');
    }
  };

  const loadPastAnalysis = (analysis: AnalysisResult) => {
    setCurrentAnalysis(analysis);
    setCompareAnalysis(null);
    setUrl(analysis.url);
    setIsSidebarOpen(false); // Close sidebar on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restoreVersion = (analysis: AnalysisResult) => {
    const newAnalysis: AnalysisResult = {
      ...analysis,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setCurrentAnalysis(newAnalysis);
    setCompareAnalysis(null);
    setHistory(prev => [newAnalysis, ...prev].slice(0, 50));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (currentAnalysis?.id === id) {
      setCurrentAnalysis(null);
      setUrl('');
      setCompareAnalysis(null);
    }
    if (compareAnalysis?.id === id) {
      setCompareAnalysis(null);
    }
  };

  const clearAllHistory = () => {
    setHistory([]);
    setCurrentAnalysis(null);
    setShowClearHistoryConfirm(false);
  };

  const exportToPDF = async (type: 'analysis' | 'documentation' = 'analysis', phaseIndices?: number[]) => {
    if (!currentAnalysis) return;
    await generatePDF(type, phaseIndices, parsedPhases, currentAnalysis);
  };

  const exportToMarkdown = (type: 'analysis' | 'documentation' = 'analysis') => {
    if (!currentAnalysis) return;
    const content = generateMarkdown(type, parsedPhases, currentAnalysis);
    const filename = `${currentAnalysis.repoName.replace(/\//g, '-')}-${type}-professional.md`;
    downloadMarkdown(content, filename);
    toast.success(`Professional ${type} Markdown exported!`);
  };

  const groupedHistory = useMemo(() => history.reduce((acc, curr) => {
    if (!acc[curr.repoName]) acc[curr.repoName] = [];
    acc[curr.repoName].push(curr);
    return acc;
  }, {} as Record<string, AnalysisResult[]>), [history]);

  const toggleRepo = (repoName: string) => {
    setExpandedRepos(prev => ({ ...prev, [repoName]: !prev[repoName] }));
  };


  const renderMarkdown = (markdown: string, nodeDetails?: Record<string, string>) => (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: MarkdownH2,
        pre: ({ children }) => <>{children}</>,
        code: (props) => (
          <MarkdownCode 
            {...props} 
            theme={theme} 
            nodeDetails={nodeDetails}
          />
        ),
        a: MarkdownA,
        table: MarkdownTable,
        thead: MarkdownThead,
        th: MarkdownTh,
        td: MarkdownTd,
        tr: MarkdownTr,
      }}
    >
      {markdown}
    </Markdown>
  );

  return (
    <ErrorBoundary>
      <Toaster position="top-center" />
      <div className="min-h-screen w-full max-w-[100vw] bg-zinc-50 dark:bg-zinc-950 flex flex-col lg:flex-row font-sans text-zinc-700 dark:text-zinc-300 selection:bg-indigo-500/30 transition-colors duration-300 overflow-x-hidden">
      
      <AnimatePresence>
        {showBlog && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-zinc-50 dark:bg-zinc-950 overflow-y-auto"
          >
            <Blog onClose={() => setShowBlog(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Blocker Detection Modal */}
      <AnimatePresence>
        {adBlockDetected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] p-10 border border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-pulse"></div>
              <div className="w-28 h-28 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-10 relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                <AlertTriangle className="w-14 h-14 text-red-500 relative z-10" />
              </div>
              <h2 className="text-4xl font-black mb-6 text-zinc-900 dark:text-white uppercase tracking-tighter">Access Restricted!</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-12 leading-relaxed font-medium text-lg">
                We've detected an <span className="text-red-500 font-black">AD BLOCKER</span>. 
                Our platform provides <span className="text-indigo-500 font-black">PREMIUM AI SERVICES FOR FREE</span>, which is only possible through ad revenue.
                <br /><br />
                To continue using the Repo Analyzer, please <span className="underline decoration-red-500 decoration-2 underline-offset-4">disable your ad blocker</span> and refresh the page.
              </p>
              <div className="space-y-6">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-black rounded-[2rem] transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-red-500/30 text-xl"
                >
                  <RefreshCw className="w-7 h-7 group-hover:rotate-180 transition-transform duration-1000" />
                  I'VE DISABLED IT, REFRESH
                </button>
                
                <div className="flex items-center gap-4 py-4">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">OR SUPPORT US</span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                </div>

                <button
                  onClick={() => window.open('https://github.com/sponsors/abhishek20040916', '_blank')}
                  className="w-full py-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-black rounded-[2rem] transition-all flex items-center justify-center gap-3 border border-black/5 dark:border-white/5"
                >
                  <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
                  SPONSOR TO REMOVE ADS
                </button>

                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black pt-4 opacity-60">
                  Strict Ad Policy Enabled
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donation Modal */}
      <PRModal
        show={showPRModal}
        onClose={() => setShowPRModal(false)}
        prConfig={prConfig}
        setPrConfig={setPrConfig}
        onGenerate={() => {
          setShowPRModal(false);
          setShowPRCommands(true);
        }}
      />


    <AnimatePresence>
      {showPRCommands && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 sm:p-10 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <GitPullRequest className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Manual PR Commands</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs tracking-widest uppercase">Apply Changes Locally</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPRCommands(false)}
                  aria-label="Close"
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-zinc-500 dark:text-zinc-400 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Since GitRepoAnalyzer does not have write access to your repository, you can apply these changes manually using the following commands in your local workspace:
                </p>

                <div className="bg-zinc-950 rounded-2xl p-4 overflow-x-auto border border-zinc-800">
                  <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
                    <code>
{`# 1. Create a new branch
git checkout -b ${prConfig.branch || `fix/repo-analyzer-${Date.now()}`}

# 2. Save the patch file
cat << 'EOF' > repo-analyzer-fix.patch
${fixDiff || 'No patch generated.'}
EOF

# 3. Apply the patch
git apply repo-analyzer-fix.patch

# 4. Commit the changes
git add .
git commit -m "${prConfig.title || 'fix: address findings from GitRepoAnalyzer'}" -m "${prConfig.body || 'Applied automated fixes from GitRepoAnalyzer.'}"

# 5. Push the branch and create a PR
git push -u origin ${prConfig.branch || `fix/repo-analyzer-${Date.now()}`}
# Then open your repository in the browser to create the Pull Request.`}
                    </code>
                  </pre>
                </div>
                
                <div className="flex justify-end mt-6 gap-4">
                  <button 
                    onClick={() => {
                      const blob = new Blob([fixDiff || ''], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'repo-analyzer-fix.patch';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black rounded-xl transition-all uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Patch
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`# 1. Create a new branch\ngit checkout -b ${prConfig.branch || `fix/gitrepoanalyzer-${Date.now()}`}\n\n# 2. Save the patch file\ncat << 'EOF' > gitrepoanalyzer-fix.patch\n${fixDiff || 'No patch generated.'}\nEOF\n\n# 3. Apply the patch\ngit apply gitrepoanalyzer-fix.patch\n\n# 4. Commit the changes\ngit add .\ngit commit -m "${prConfig.title || 'fix: address findings from GitRepoAnalyzer'}" -m "${prConfig.body || 'Applied automated fixes from GitRepoAnalyzer.'}"\n\n# 5. Push the branch and create a PR\ngit push -u origin ${prConfig.branch || `fix/gitrepoanalyzer-${Date.now()}`}`);
                      alert('Commands copied to clipboard!');
                    }}
                    className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Commands
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <AboutModal
        show={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />


    <DonationModal
        show={showDonationModal}
        onClose={() => setShowDonationModal(false)}
      />


      <FeedbackModal
        show={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />


      
      <TermsModal
        show={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />


      
      <PrivacyModal
        show={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />


      
      <CookieModal
        show={showCookieModal}
        onClose={() => setShowCookieModal(false)}
      />





      {/* Mobile Header */}

      <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-zinc-950/80 border-b border-black/5 dark:border-white/5 sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 shadow-sm">
        <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-inner border border-white/10">
            <Github className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">GitRepoAnalyzer</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowBlog(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Blog
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/20 transition-all flex items-center justify-center shadow-sm hover:shadow"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
            className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-black/5 dark:border-white/5 transition-all shadow-sm hover:shadow"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - History */}
      <aside id="sidebar" className={`fixed top-0 left-0 h-[100dvh] w-[85vw] sm:w-80 lg:w-96 bg-white/95 dark:bg-zinc-950/95 lg:bg-white/80 lg:dark:bg-zinc-950/80 border-r border-black/5 dark:border-white/5 flex flex-col z-50 lg:z-20 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} backdrop-blur-md shadow-[8px_0_40px_rgba(0,0,0,0.08)] dark:shadow-[8px_0_40px_rgba(0,0,0,0.4)] overflow-hidden`}>
        <div className="p-5 lg:p-8 border-b border-black/5 dark:border-white/5 bg-zinc-50/80 dark:bg-zinc-900/80 flex flex-col gap-4 lg:gap-5 relative overflow-hidden group/header shrink-0">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover/header:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div role="img" aria-label="Abstract technology background representing code analysis and AI" className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-[0.03] dark:opacity-[0.05] mix-blend-luminosity pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 lg:mb-5">
              <div className="flex items-center gap-3 lg:gap-3.5 text-zinc-900 dark:text-zinc-100">
                <div className="p-2 lg:p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl lg:rounded-2xl shadow-lg shadow-indigo-500/20 border border-white/10 relative overflow-hidden group/logo">
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/logo:animate-[shimmer_1.5s_infinite]"></div>
                  <Github className="w-5 h-5 lg:w-6 lg:h-6 text-white relative z-10" />
                </div>
                <span className="text-xl lg:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">GitRepoAnalyzer</span>
              </div>
              <div className="flex items-center gap-4">
                {isGlowing && (
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                )}
                <button 
                  onClick={toggleTheme}
                  className="hidden lg:flex p-2.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 transition-all items-center justify-center shadow-sm hover:shadow hover:scale-105"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close Sidebar"
                  className="lg:hidden p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-xs lg:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 lg:mb-6 font-medium hidden sm:block">AI-powered GitHub repository insights, architecture, and security checks.</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button 
                  onClick={() => setShowAboutModal(true)}
                  className="w-full px-3 py-2.5 bg-indigo-500/10 dark:bg-indigo-500/20 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 transition-all flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md group relative overflow-hidden text-[10px] text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Info className="w-4 h-4 text-indigo-500" /> 
                  <span>Features</span>
                </button>

                <button 
                  onClick={() => setShowBlog(true)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold border border-black/5 dark:border-white/5 transition-all flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md group relative overflow-hidden text-[10px] text-center"
                  title="Read our latest articles"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <BookOpen className="w-4 h-4 text-indigo-500" /> 
                  <span>Blog</span>
                </button>
                <button 
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold border border-black/5 dark:border-white/5 transition-all flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md group relative overflow-hidden text-[10px] text-center"
                  title="Report issues or request features"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Mail className="w-4 h-4 text-indigo-500" /> 
                  <span>Feedback</span>
                </button>
                <button 
                  onClick={() => setShowDonationModal(true)}
                  className="w-full px-3 py-2.5 bg-pink-500/5 dark:bg-pink-500/10 hover:bg-pink-500/10 dark:hover:bg-pink-500/20 rounded-xl text-pink-600 dark:text-pink-400 font-bold border border-pink-500/20 transition-all flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md group relative overflow-hidden text-[10px] text-center"
                >
                  <Heart className="w-4 h-4 fill-pink-500/20 group-hover:fill-pink-500 transition-all" />
                  <span>Support</span>
                </button>
              </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 min-h-0">
            {currentAnalysis && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-2xl p-5 shadow-sm"
              >
                <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  Current Analysis
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Phases</span>
                    <span className="text-xs font-black text-indigo-500">13/13</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Findings</span>
                    <span className="text-xs font-black text-rose-500">{findings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Depth</span>
                    <span className="text-xs font-black text-emerald-500 capitalize">{analysisDepth}</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-2 px-2">
                <div className="flex items-center gap-2.5 text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.25em]">
                  <History className="w-4 h-4 text-indigo-500" />
                  <span>History</span>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={() => setShowClearHistoryConfirm(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                    title="Clear All History"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              
              {Object.keys(groupedHistory).length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-zinc-50/30 dark:bg-zinc-900/30">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                    <History className="w-5 h-5 text-zinc-400" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">No past analyses</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {Object.entries(groupedHistory).map(([repoName, versions]) => {
                    const isExpanded = expandedRepos[repoName];
                    return (
                      <li key={repoName} className="group/repo border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm transition-all hover:border-black/10 dark:hover:border-white/10 hover:shadow-md">
                        <button
                          onClick={() => toggleRepo(repoName)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-1.5 rounded-lg transition-all ${isExpanded ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'}`}>
                              {isExpanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                            </div>
                            <span className="font-black truncate text-xs text-zinc-800 dark:text-zinc-100 tracking-tight">{repoName}</span>
                          </div>
                          <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/5 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full shrink-0 group-hover/repo:bg-indigo-500 group-hover/repo:text-white group-hover/repo:border-indigo-500 transition-all">
                            {versions.length}
                          </span>
                        </button>
                        
                        {isExpanded && (
                          <ul className="divide-y divide-black/5 dark:divide-white/5 bg-zinc-50/30 dark:bg-zinc-950/30 border-t border-black/5 dark:border-white/5">
                            {versions.map((item) => (
                              <li key={item.id}>
                                <div className="flex items-center group/item">
                                  <button
                                    onClick={() => loadPastAnalysis(item)}
                                    className={"flex-1 text-left p-3 transition-all flex justify-between items-center " + (
                                      currentAnalysis?.id === item.id 
                                        ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' 
                                        : 'hover:bg-white/50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    )}
                                  >
                                    <div className="flex flex-col pl-1">
                                      <span className="text-[10px] flex items-center gap-2 font-bold">
                                        <Clock className={`w-3 h-3 ${currentAnalysis?.id === item.id ? 'text-indigo-500' : 'opacity-40'}`} />
                                        {new Date(item.timestamp).toLocaleString(undefined, {
                                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    {currentAnalysis?.id === item.id && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    )}
                                  </button>
                                  <button 
                                    onClick={(e) => deleteHistoryItem(e, item.id)}
                                    className="p-3 text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover/item:opacity-100"
                                    title="Delete this analysis"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 overflow-y-auto relative w-full bg-zinc-50 dark:bg-zinc-950 lg:pl-96">
        
        {/* Advanced Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
          <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTUwLCAxNTAsIDE1MCwgMC4wNSkiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>
        </div>

        {/* Top Ad Space */}
        <AdBanner depth={analysisDepth} height="h-24" className="border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md relative z-10 shadow-sm" text="Top Leaderboard Ad" />
        <AdBanner depth={analysisDepth} height="h-12" className="bg-indigo-500/5 dark:bg-indigo-500/10 border-b border-black/5 dark:border-white/5" text="Premium Feature Sponsor" />
        <AdBanner depth={analysisDepth} height="h-8" className="bg-rose-500/5 dark:bg-rose-500/10 border-b border-black/5 dark:border-white/5" text="Flash Sale: 50% OFF" />
        <AdBanner depth={analysisDepth} height="h-10" className="bg-amber-500/5 dark:bg-amber-500/10 border-b border-black/5 dark:border-white/5" text="New AI Tools Available" />

        <div className="p-3 sm:p-6 lg:p-12 max-w-full mx-auto w-full flex-1 relative z-10">
          <div className="min-w-0">
            {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-6 sm:p-8 lg:p-12 rounded-3xl lg:rounded-[2.5rem] border border-white/20 dark:border-white/10 mb-6 lg:mb-10 shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl lg:rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 lg:mb-3 text-zinc-900 dark:text-white flex items-center gap-3 lg:gap-4 tracking-tight">
                <div className="p-2 lg:p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl lg:rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 shadow-inner">
                  <Activity className="w-6 h-6 lg:w-7 lg:h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                Analyze GitHub Repository with AI
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6 lg:mb-10 text-sm sm:text-base lg:text-lg font-medium max-w-2xl">Enter a GitHub repository URL to generate a comprehensive AI-powered analysis, architecture diagram, security review, and automated code fixes. Optimize your code and generate project documentation instantly.</p>
              
              <AdBanner depth={analysisDepth} height="h-20" className="mb-6 lg:mb-10 rounded-2xl lg:rounded-3xl border border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50" text="Search Header Ad" />
              <AdBanner depth={analysisDepth} height="h-12" className="mb-4 rounded-xl border border-black/5 dark:border-white/5 bg-blue-500/5" text="Cloud Hosting Deals" />
              <AdBanner depth={analysisDepth} height="h-12" className="mb-4 rounded-xl border border-black/5 dark:border-white/5 bg-purple-500/5" text="Hire Top Developers" />
              
              <form onSubmit={handleAnalyzeClick} className="flex gap-3 lg:gap-4 flex-col sm:flex-row items-stretch">
                <div className="relative flex-1 group/input">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl lg:rounded-[1.5rem] blur opacity-20 group-focus-within/input:opacity-60 transition duration-500"></div>
                  <div className="relative flex items-center bg-white dark:bg-zinc-950 rounded-2xl lg:rounded-[1.5rem] border border-black/10 dark:border-white/10 overflow-hidden shadow-inner h-full">
                    <Search className="absolute left-4 lg:left-6 w-5 h-5 lg:w-6 lg:h-6 text-zinc-400 group-focus-within/input:text-indigo-500 transition-colors" />
                    <input
                      type="url"
                      aria-label="GitHub Repository URL"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (error) setError(null);
                      }}
                      pattern="^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\/)?$"
                      title="Must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)"
                      placeholder="https://github.com/owner/repo"
                      className="w-full pl-12 lg:pl-16 pr-4 lg:pr-6 py-4 lg:py-6 bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-mono text-sm sm:text-base lg:text-lg transition-all"
                      required
                    />
                    <button
                      type="button"
                      aria-label="Paste from clipboard"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text && text.includes('github.com')) {
                            setUrl(text);
                            handleAnalyzeClick();
                          } else {
                            setError('Clipboard does not contain a valid GitHub URL.');
                          }
                        } catch (e) {
                          setError('Failed to read clipboard. Please paste manually.');
                        }
                      }}
                      className="absolute right-3 lg:right-4 p-2 lg:p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-zinc-500 dark:text-zinc-400 transition-all flex items-center gap-2 font-bold text-xs lg:text-sm"
                      title="Paste from clipboard"
                    >
                      <Copy className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">Paste</span>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="relative overflow-hidden bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 text-white dark:text-zinc-900 px-6 sm:px-10 py-4 lg:py-6 rounded-2xl lg:rounded-[1.5rem] font-extrabold text-base lg:text-lg flex items-center justify-center gap-2 lg:gap-3 transition-all whitespace-nowrap shadow-xl disabled:shadow-none sm:w-auto w-full group/btn hover:shadow-indigo-500/25 dark:hover:shadow-indigo-500/25 hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-white/20 to-indigo-500/0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Activity className="w-6 h-6" />
                      Check Repo
                    </>
                  )}
                </button>
              </form>
              
              <AdBanner depth={analysisDepth} height="h-16" className="mt-6 lg:mt-10 rounded-2xl border border-black/5 dark:border-white/5 bg-zinc-50/30 dark:bg-zinc-900/30" text="Search Footer Ad" />
              <AdBanner depth={analysisDepth} height="h-24" className="mt-4 rounded-2xl border border-black/5 dark:border-white/5 bg-emerald-500/5" text="Green Energy Hosting" />

              {error && (
                <motion.div 
                  role="alert"
                  aria-live="assertive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-sm flex items-start gap-3 border border-red-200 dark:border-red-500/20 shadow-sm"
                >
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{error}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          <AdBanner depth={analysisDepth} height="h-20" className="mb-6 rounded-2xl border border-black/10 dark:border-white/10" text="In-Feed Ad Placement" />
          <AdBanner depth={analysisDepth} height="h-20" className="mb-6 rounded-2xl border border-black/10 dark:border-white/10 bg-orange-500/5" text="E-commerce Solutions" />
          <AdBanner depth={analysisDepth} height="h-20" className="mb-6 rounded-2xl border border-black/10 dark:border-white/10 bg-cyan-500/5" text="Cybersecurity Audit" />
          <AdBanner depth={analysisDepth} height="h-20" className="mb-6 rounded-2xl border border-black/10 dark:border-white/10 bg-rose-500/5" text="Summer Sale: 70% OFF" />
          <AdBanner depth={analysisDepth} height="h-20" className="mb-6 rounded-2xl border border-black/10 dark:border-white/10 bg-indigo-500/5" text="New AI Features" />

          {!currentAnalysis && !isConfiguring && (
            <div className="mb-12">
              <AdBanner depth={analysisDepth} height="h-24 lg:h-32" text="Pre-Analysis Featured Sponsor" className="rounded-[2rem] border-black/5 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md" />
            </div>
          )}

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {isConfiguring ? (
              <motion.div
                key="configuring"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl lg:rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] overflow-hidden p-6 sm:p-8 lg:p-12 relative group/config"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none opacity-0 group-hover/config:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl lg:rounded-[2.5rem] blur-xl opacity-0 group-hover/config:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 mb-8 lg:mb-12 relative z-10">
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 lg:mb-3 text-zinc-900 dark:text-white flex items-center gap-3 lg:gap-4 tracking-tight">
                      <div className="p-2 lg:p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl lg:rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 shadow-inner group-hover/config:scale-110 transition-transform duration-500">
                        <Settings className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600 dark:text-indigo-400 group-hover/config:rotate-90 transition-transform duration-700" />
                      </div>
                      Configure Analysis
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-medium">
                      Select the specific insights you need.
                    </p>
                  </div>
                </div>

                {/* Analysis Depth Selection */}
                <div className="mb-6 relative z-10">
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['quick', 'standard', 'deep'] as AnalysisDepth[]).map((depth) => (
                      <button
                        key={depth}
                        onClick={() => setAnalysisDepth(depth)}
                        className={`relative group/depth p-2 rounded-xl border transition-all duration-500 flex flex-col items-center gap-1 ${
                          analysisDepth === depth
                            ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/10'
                            : 'border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 hover:border-indigo-500/30 hover:bg-white dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg transition-all duration-500 ${analysisDepth === depth ? 'bg-indigo-500 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 group-hover/depth:bg-indigo-500/10 group-hover/depth:text-indigo-500'}`}>
                          {depth === 'quick' && <Zap className="w-3 h-3" />}
                          {depth === 'standard' && <Activity className="w-3 h-3" />}
                          {depth === 'deep' && <Sparkles className="w-3 h-3" />}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-black uppercase tracking-[0.1em]">
                            {depth === 'quick' ? 'Quick' : depth === 'standard' ? 'Standard' : 'Deep'}
                          </span>
                        </div>
                        {analysisDepth === depth && (
                          <motion.div layoutId="depth-indicator" className="absolute -top-1 -right-1 bg-indigo-500 text-white p-0.5 rounded-full shadow-md border border-white dark:border-zinc-900">
                            <CheckCircle2 className="w-2 h-2" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <AdBanner depth={analysisDepth} height="h-24" className="mb-8 lg:mb-12 rounded-3xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 shadow-sm" text="Feature Selection Ad" />

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-8 lg:mb-12 relative z-10">
                  {FEATURES.map((f, i) => {
                    const isUnlocked = true;
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        key={f.id} 
                        className={`group relative p-4 lg:p-5 rounded-xl lg:rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col h-full border-indigo-500/40 bg-indigo-50/80 dark:bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                        <div className="relative z-10 flex items-start justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2.5 font-extrabold text-sm lg:text-base text-zinc-900 dark:text-zinc-100 tracking-tight min-w-0 flex-1">
                            <div className="shrink-0 p-2 rounded-lg transition-all duration-300 shadow-sm bg-indigo-500 text-white shadow-indigo-500/30">
                              <f.icon className="w-4 h-4 lg:w-5 lg:h-5" aria-label={`Icon for ${f.title}`} />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="truncate">{f.title}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="relative z-10 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium break-words mb-4 flex-1">{f.description}</p>
                        
                        <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5 flex justify-end">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 shadow-sm backdrop-blur-sm w-full justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                            Ready
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-6 lg:pt-8 border-t border-black/10 dark:border-white/10 relative z-10">
                  <div className="flex items-center gap-4">
                    {/* Removed verification logic as it was unused/undefined */}
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3 lg:gap-4 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsConfiguring(false)} 
                      className="px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-sm lg:text-base text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm hover:shadow"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => executeAnalysis(url)} 
                      className="relative overflow-hidden px-8 lg:px-10 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-extrabold text-sm lg:text-base text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 lg:gap-3 group/start"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/start:animate-[shimmer_1.5s_infinite]"></div>
                      <Zap className="w-4 h-4 lg:w-5 lg:h-5 relative z-10 group-hover/start:scale-110 transition-transform" />
                      <span className="relative z-10">Start Analysis</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : loading ? (
              <motion.div 
                key="loading"
                aria-live="polite"
                aria-busy="true"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full space-y-6"
              >
                <AdBanner depth={analysisDepth} height="h-20" className="bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-black/5 dark:border-white/5" text="Analysis Sponsor" />
                
                {/* Progress Section */}
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] transition-colors duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl lg:rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 mb-6 lg:mb-8 relative z-10">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-3 lg:gap-4 tracking-tight">
                      <div className="p-2 lg:p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl lg:rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 shadow-inner">
                        <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Current Phase</span>
                        {analysisStep || 'Analyzing Repository...'}
                      </div>
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')} elapsed</span>
                      </div>
                      {estimatedTimeRemaining !== null && (
                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-pulse">
                          <Zap className="w-3.5 h-3.5" />
                          <span>~{Math.floor(estimatedTimeRemaining / 60)}:{(estimatedTimeRemaining % 60).toString().padStart(2, '0')} remaining</span>
                        </div>
                      )}
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium h-5 overflow-hidden w-full sm:w-auto">
                        <motion.span
                          key={Math.floor(elapsedTime / 5)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="block"
                        >
                          {
                            [
                              "Inspecting code architecture...",
                              "Analyzing dependency graph...",
                              "Scanning for security vulnerabilities...",
                              "Evaluating code quality metrics...",
                              "Generating architectural diagrams...",
                              "Synthesizing actionable insights...",
                              "Deep diving into hidden patterns...",
                              "Cross-referencing best practices...",
                              "Optimizing performance vectors...",
                              "Validating scalability patterns..."
                            ][Math.floor(elapsedTime / 5) % 10]
                          }
                        </motion.span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl border border-black/10 dark:border-white/10 shadow-inner shrink-0 relative overflow-hidden group/progress">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover/progress:opacity-100 transition-opacity duration-500"></div>
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums leading-none tracking-tighter relative z-10">{analysisProgress}%</span>
                  </div>
                </div>
                <div className="h-5 w-full bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-black/10 dark:border-white/10 shadow-inner relative z-10">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                    style={{ width: `${analysisProgress}%`, backgroundSize: '200% 100%', animation: 'gradientMove 2s linear infinite' }}
                  />
                </div>
                
                {/* Advanced Dynamic Phase Stepper */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    "Input",
                    "Architecture",
                    "Code Quality",
                    "Security",
                    "Performance",
                    "Scalability",
                    "Testing",
                    "DX",
                    "Improvement Plan",
                    "Master Prompt",
                    "Setup & Run",
                    "AI Summary"
                  ].map((phase, idx) => {
                    const currentPhaseMatch = analysisStep.match(/PHASE (\d+)/);
                    const currentPhaseIdx = currentPhaseMatch ? parseInt(currentPhaseMatch[1], 10) : (analysisStep === 'Finalizing results...' ? 12 : -1);
                    
                    const isCompleted = currentPhaseIdx > idx || analysisStep === 'Finalizing results...';
                    const isActive = currentPhaseIdx === idx;

                    return (
                      <div 
                        key={idx} 
                        className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                          isActive 
                            ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                            : isCompleted 
                              ? 'bg-emerald-500/10 border-emerald-500/30' 
                              : 'bg-zinc-50 dark:bg-zinc-900/50 border-black/5 dark:border-white/5 opacity-50'
                        }`}
                      >
                        <div className={`text-xs font-black mb-1 ${
                          isActive ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                        }`}>
                          PHASE {idx}
                        </div>
                        <div className={`text-[10px] text-center font-bold uppercase tracking-wider ${
                          isActive ? 'text-indigo-700 dark:text-indigo-300' : isCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-500'
                        }`}>
                          {phase}
                        </div>
                        {isActive && (
                          <motion.div 
                            layoutId="activePhaseIndicator"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-500 rounded-full"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Collapsible Analysis Logs */}
                <div className="mt-8 border-t border-black/5 dark:border-white/5 pt-6">
                  <button 
                    onClick={() => setShowAnalysisLogs(!showAnalysisLogs)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-black/5 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all group/logs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500 group-hover/logs:scale-110 transition-transform">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Analysis Process Logs</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${showAnalysisLogs ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showAnalysisLogs && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-zinc-950 rounded-2xl border border-white/5 font-mono text-[10px] leading-relaxed text-zinc-400 max-h-[200px] overflow-y-auto custom-scrollbar">
                          {analysisLogs.map((log, i) => (
                            <div key={i} className="py-0.5 border-b border-white/5 last:border-0">
                              <span className="text-indigo-500/70 mr-2">{log.match(/\[(.*?)\]/)?.[0]}</span>
                              <span>{log.replace(/\[.*?\]/, '')}</span>
                            </div>
                          ))}
                          <div className="animate-pulse text-indigo-400 mt-2 flex items-center gap-2">
                            <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                            Awaiting next process step...
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <AdBanner depth={analysisDepth} height="h-20" className="bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-black/5 dark:border-white/5" text="Deep Analysis Sponsor" />

              {/* Skeleton Loaders */}
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] space-y-8 lg:space-y-12 transition-colors duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl lg:rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                {/* Header Skeleton */}
                <div className="space-y-4 lg:space-y-6 border-b border-black/10 dark:border-white/10 pb-8 lg:pb-12 relative z-10">
                  <div className="h-12 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl w-1/3 animate-pulse shadow-inner" />
                  <div className="flex gap-4">
                    <div className="h-8 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl w-28 animate-pulse shadow-inner" />
                    <div className="h-8 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl w-36 animate-pulse shadow-inner" />
                  </div>
                </div>

                {/* Content Skeletons */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-6 relative z-10">
                    <div className="h-10 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl w-1/4 animate-pulse shadow-inner" />
                    <div className="space-y-4">
                      <div className="h-5 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl w-full animate-pulse shadow-inner" />
                      <div className="h-5 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl w-5/6 animate-pulse shadow-inner" />
                      <div className="h-5 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl w-4/6 animate-pulse shadow-inner" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : currentAnalysis ? (
            <motion.div 
              key="results"
              aria-live="polite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl lg:rounded-[2.5rem] border border-white/20 dark:border-white/10 overflow-hidden flex flex-col shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] transition-colors duration-300 relative group"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="bg-zinc-50/80 dark:bg-zinc-950/80 p-6 sm:p-8 lg:p-12 border-b border-black/5 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 transition-colors duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight break-all">
                      {currentAnalysis.repoName}
                    </h2>
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/5 px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 shadow-sm">
                      <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      {new Date(currentAnalysis.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <a 
                    href={currentAnalysis.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-base text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors break-all group/link bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-xl"
                  >
                    <Github className="w-5 h-5 shrink-0" />
                    View on GitHub <ExternalLink className="w-4 h-4 shrink-0 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
              <AdBanner depth={analysisDepth} height="h-16" className="border-b border-black/5 dark:border-white/5 bg-zinc-50/30 dark:bg-zinc-900/30" text="Analysis Header Sponsor" />
              <AdBanner depth={analysisDepth} height="h-8" className="bg-amber-500/5 dark:bg-amber-500/10 border-b border-black/5 dark:border-white/5" text="Premium Content Ad" />
              <AdBanner depth={analysisDepth} height="h-12" className="bg-indigo-500/5 dark:bg-indigo-500/10 border-b border-black/5 dark:border-white/5" text="Analysis Sidebar Sponsor" />
              
              {compareAnalysis ? (
                <div className="p-6 sm:p-8 lg:p-12 relative z-10">
                  <div className="mb-8 lg:mb-10 pb-6 lg:pb-8 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 lg:gap-8">
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white m-0 flex items-center gap-3 lg:gap-4 tracking-tight">
                        <div className="p-2 lg:p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl lg:rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 shadow-inner">
                          <GitCompare className="w-6 h-6 lg:w-7 lg:h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Visual Version Diff
                      </h3>
                      <p className="text-sm sm:text-base lg:text-lg text-zinc-500 dark:text-zinc-400 m-0 mt-3 lg:mt-4">
                        Comparing <span className="text-rose-600 dark:text-rose-400 font-bold px-3 py-1.5 bg-rose-500/10 dark:bg-rose-400/10 rounded-xl border border-rose-500/20 shadow-sm">{new Date(compareAnalysis.timestamp).toLocaleString()}</span> with <span className="text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl border border-emerald-500/20 shadow-sm">{new Date(currentAnalysis.timestamp).toLocaleString()}</span>
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const contentElement = document.getElementById('diff-content');
                          if (!contentElement) return;
                          
                          document.body.classList.add('is-printing');
                          
                          const container = document.createElement('div');
                          container.id = 'printable-report';
                          container.style.padding = '40px';
                          container.style.color = '#18181b';
                          container.style.backgroundColor = '#ffffff';
                          container.style.fontFamily = 'sans-serif';
                          
                          const header = document.createElement('div');
                          header.innerHTML = `
                            <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px; font-family: sans-serif;">${currentAnalysis.repoName} - Diff Report</h1>
                            <p style="color: #71717a; font-size: 14px; margin-bottom: 24px; font-family: sans-serif;">Comparing ${new Date(compareAnalysis.timestamp).toLocaleString()} with ${new Date(currentAnalysis.timestamp).toLocaleString()}</p>
                            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin-bottom: 32px;" />
                          `;
                          container.appendChild(header);
                          
                          const clonedContent = contentElement.cloneNode(true) as HTMLElement;
                          container.appendChild(clonedContent);
                          
                          document.body.appendChild(container);
                          
                          setTimeout(() => {
                            window.print();
                            
                            setTimeout(() => {
                              document.body.classList.remove('is-printing');
                              if (document.body.contains(container)) {
                                document.body.removeChild(container);
                              }
                            }, 1000);
                          }, 100);
                        }}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <FileText className="w-4 h-4" /> Export Diff (.pdf)
                      </button>
                      <button 
                        onClick={() => setCompareAnalysis(null)}
                        className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-8 py-4 rounded-2xl transition-all shadow-sm hover:shadow"
                      >
                        Close Diff
                      </button>
                    </div>
                  </div>
                  <div id="diff-content">
                    <DiffView oldText={compareAnalysis.markdown} newText={currentAnalysis.markdown} />
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 lg:p-12 relative z-10">
                  <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 mb-8 lg:mb-10 border-b border-black/10 dark:border-white/10 pb-6 lg:pb-8">
                    <AdBanner depth={analysisDepth} height="h-16" className="w-full mb-6 rounded-2xl border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50" text="Analysis Toolbar Ad" />
                  </div>

                  <div id="analysis-content" className="w-full max-w-full overflow-hidden flex flex-col">
                    <AdBanner depth={analysisDepth} height="h-24" className="w-full mb-10 rounded-3xl border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50" text="Main Analysis Leaderboard" />
                    
                    {/* Repository Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                      {[
                        { label: 'Files Analyzed', value: currentAnalysis.fileTree.length.toString(), icon: FileText, color: 'text-blue-500' },
                        { label: 'Architecture Nodes', value: Object.keys(currentAnalysis.nodeDetails || {}).length || '42', icon: Network, color: 'text-indigo-500' },
                        { label: 'Security Score', value: '94%', icon: Shield, color: 'text-emerald-500' },
                        { label: 'Optimization', value: 'High', icon: Zap, color: 'text-amber-500' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-black/5 dark:border-white/5 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                          <div className="flex items-center gap-3 mb-2">
                            <stat.icon className={`w-4 h-4 ${stat.color} transition-transform group-hover:scale-110`} />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                          </div>
                          <div className="text-xl font-black text-zinc-900 dark:text-white">{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    <AnalysisDisplay analysis={currentAnalysis} theme={theme} />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-10 border-t border-black/10 dark:border-white/10 pt-8">
                      <button
                        onClick={() => setIsFixMode(!isFixMode)}
                        className={`group relative flex items-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest rounded-2xl transition-all border overflow-hidden ${
                          isFixMode 
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {isFixMode && (
                          <motion.div 
                            layoutId="fixModeGlow"
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                          />
                        )}
                        <Zap className={`w-4 h-4 transition-transform group-hover:scale-110 ${isFixMode ? 'fill-white animate-pulse' : ''}`} />
                        {isFixMode ? 'Exit Fix Mode' : 'Enter Fix Mode'}
                      </button>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => copyToClipboard(currentAnalysis.markdown)}
                          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow"
                        >
                          <Copy className="w-4 h-4" /> Copy
                        </button>
                        <div className="flex items-center gap-1 bg-zinc-500/5 dark:bg-zinc-500/10 p-1 rounded-2xl border border-zinc-500/20">
                          <button
                            onClick={() => exportToMarkdown('analysis')}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow"
                          >
                            <FileText className="w-4 h-4" /> Analysis (.md)
                          </button>
                          <button
                            onClick={() => exportToMarkdown('documentation')}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow"
                          >
                            <BookOpen className="w-4 h-4" /> Docs (.md)
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-indigo-500/5 dark:bg-indigo-500/10 p-1 rounded-2xl border border-indigo-500/20">
                          <button 
                            onClick={() => exportToPDF('analysis')}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md hover:shadow-lg"
                          >
                            <Download className="w-4 h-4" /> Analysis PDF
                          </button>
                        </div>

                        <div className="flex items-center gap-1 bg-emerald-500/5 dark:bg-emerald-500/10 p-1 rounded-2xl border border-emerald-500/20">
                          <button 
                            onClick={() => exportToPDF('documentation')}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md hover:shadow-lg"
                          >
                            <BookOpen className="w-4 h-4" /> Docs PDF
                          </button>
                        </div>
                      </div>

                    </div>

                    {isFixMode && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mt-10 relative overflow-hidden bg-zinc-900 dark:bg-zinc-950 rounded-[2rem] lg:rounded-[3rem] border border-zinc-800 shadow-2xl w-full max-w-[1400px] mx-auto"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                        
                        <div className="p-4 sm:p-6 lg:p-12 relative z-10">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                            <div className="max-w-2xl">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 shadow-inner">
                                  <Wand2 className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl lg:text-4xl font-black text-white uppercase tracking-tighter">Fix Mode Workspace</h3>
                              </div>
                              <p className="text-zinc-400 font-medium text-sm lg:text-base leading-relaxed">Select identified issues below. Our AI will clone, update, and package the repository for you with surgical precision.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-black/40 p-2 sm:p-3 rounded-2xl sm:rounded-3xl border border-white/5 backdrop-blur-md">
                              <button 
                                onClick={() => setSelectedFindings([])}
                                className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-all active:scale-95"
                              >
                                Clear All
                              </button>
                              <button 
                                onClick={() => setShowFixPrompt(true)}
                                disabled={isGeneratingFix}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] sm:text-xs lg:text-sm font-black rounded-lg sm:rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] uppercase tracking-[0.12em] flex items-center gap-2 sm:gap-3 active:scale-95 group/fix relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/fix:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                                {isGeneratingFix ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4 group-hover/fix:translate-y-0.5 transition-transform" /> {selectedFindings.length > 0 ? 'Fix & Zip' : 'Fix All & Zip'}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2 sm:pr-3 custom-scrollbar">
                          {findings.length > 0 ? (
                            findings.map((finding, idx) => (
                              <div 
                                key={idx}
                                onClick={() => {
                                  if (selectedFindings.includes(finding)) {
                                    setSelectedFindings(selectedFindings.filter(f => f !== finding));
                                  } else {
                                    setSelectedFindings([...selectedFindings, finding]);
                                  }
                                }}
                                className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                                  selectedFindings.includes(finding)
                                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : 'bg-zinc-800/40 border-zinc-700/30 hover:bg-zinc-800/60 hover:border-zinc-600'
                                }`}
                              >
                                {selectedFindings.includes(finding) && (
                                  <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/20 blur-xl rounded-full"></div>
                                )}
                                <div className="flex items-start gap-2 sm:gap-3 relative z-10">
                                  <div className={`mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                    selectedFindings.includes(finding)
                                      ? 'border-emerald-500 bg-emerald-500 rotate-0 scale-110'
                                      : 'border-zinc-600 group-hover:border-zinc-500 rotate-45 scale-90'
                                  }`}>
                                    {selectedFindings.includes(finding) && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />}
                                  </div>
                                  <p className={`text-[10px] sm:text-xs lg:text-sm leading-relaxed font-semibold tracking-tight ${
                                    selectedFindings.includes(finding) ? 'text-emerald-50' : 'text-zinc-400 group-hover:text-zinc-200'
                                  }`}>
                                    {finding.replace(/^#+\s*/, '').replace(/^- \[[ x]\]\s*/, '').substring(0, 150)}{finding.length > 150 ? '...' : ''}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full py-20 text-center bg-black/20 rounded-[2rem] border border-white/5">
                              <div className="w-20 h-20 bg-zinc-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-700/50 shadow-2xl">
                                <Search className="w-10 h-10 text-zinc-600" />
                              </div>
                              <p className="text-zinc-400 font-black text-sm uppercase tracking-[0.3em]">No actionable findings detected yet.</p>
                              <p className="text-zinc-500 text-xs mt-3 font-medium">Try a deeper analysis or wait for the scan to complete.</p>
                            </div>
                          )}
                        </div>

                        <FixModePrompt 
                          isFixing={isGeneratingFix}
                          fixDiff={fixDiff}
                          fixedFiles={fixedFiles}
                          isDownloadingRepo={isDownloadingRepo}
                          onGenerateFix={generateFix}
                          onGetPatch={() => {
                            const blob = new Blob([fixDiff || ''], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `repo-analyzer-fix-${Date.now()}.patch`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          onDownloadZip={() => downloadUpdatedRepo()}
                          renderMarkdown={renderMarkdown}
                        />
                        </div>
                      </motion.div>
                    )}
                    <div className="mt-16 pt-10 border-t border-black/10 dark:border-white/10">
                      <AdBanner depth={analysisDepth} height="h-32 lg:h-40" text="In-Content Advertisement" />
                      <div className="mt-12">
                        <AdBanner depth={analysisDepth} height="h-24 lg:h-28" text="Main Page Footer Ad" className="rounded-3xl border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-16 sm:py-24 lg:py-36 px-6 lg:px-10 border border-white/20 dark:border-white/10 rounded-3xl lg:rounded-[3rem] bg-white/60 dark:bg-zinc-900/60 text-zinc-500 backdrop-blur-md transition-colors duration-300 shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] relative overflow-hidden group/empty"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none opacity-0 group-hover/empty:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-purple-500/0 opacity-0 group-hover/empty:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[3rem] blur-xl opacity-0 group-hover/empty:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="w-24 h-24 lg:w-28 lg:h-28 mx-auto bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-black/5 dark:border-white/5 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl rotate-3 group-hover/empty:rotate-6 group-hover/empty:scale-105 transition-all duration-500 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2rem] opacity-0 group-hover/empty:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover/empty:opacity-100 transition-opacity duration-500"></div>
                        <Github className="w-12 h-12 lg:w-14 lg:h-14 text-zinc-400 dark:text-zinc-500 group-hover/empty:text-indigo-500 transition-colors duration-500 relative z-10" />
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white mb-5 tracking-tight group-hover/empty:text-transparent group-hover/empty:bg-clip-text group-hover/empty:bg-gradient-to-r group-hover/empty:from-indigo-600 group-hover/empty:to-purple-600 dark:group-hover/empty:from-indigo-400 dark:group-hover/empty:to-purple-400 transition-all duration-500">Ready to Analyze</h2>
                      <p className="max-w-lg mx-auto leading-relaxed text-base lg:text-lg text-zinc-500 dark:text-zinc-400 font-medium">Paste a GitHub repository link above to get a detailed breakdown of its architecture, security, and a creative master prompt.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        {/* About Section */}
        <div className="mt-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-950"></div>
          <div role="img" aria-label="Abstract technology background representing code analysis and AI" className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent"></div>
          
          <div className="max-w-6xl mx-auto px-6 py-20 lg:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight">AI-Powered Code Intelligence at Scale</h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Empowering developers with deep architectural understanding, automated code fixes, and security foresight through advanced AI repository analysis.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors duration-300 group">
                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Deep Repository Analysis</h3>
                <p className="text-zinc-400 leading-relaxed">
                  We use advanced AI models to read through repository metadata, code structure, and documentation to understand the core architecture and purpose of your GitHub projects.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors duration-300 group">
                <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/30 group-hover:scale-110 transition-transform duration-300">
                  <ShieldAlert className="w-7 h-7 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Automated Security Review</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Get instant feedback on potential vulnerabilities, outdated dependencies, and security misconfigurations before you deploy with our AI code reviewer.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors duration-300 group">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Actionable Code Fixes</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Receive concrete recommendations for refactoring, performance optimization, automated bug fixes, and generate comprehensive project documentation instantly.
                </p>
              </div>
            </div>

            <div className="mt-24 text-center border-t border-white/10 pt-16">
              <h2 className="text-2xl font-bold text-white mb-8">Supported Technologies & Frameworks</h2>
              <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                {['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Next.js', 'Vue', 'Angular', 'Go', 'Rust', 'Java', 'C++', 'Ruby on Rails', 'PHP', 'Docker', 'Kubernetes'].map((tech) => (
                  <span key={tech} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors cursor-default">
                    {tech}
                  </span>
                ))}
              </div>
              <p className="text-zinc-500 mt-8 text-sm max-w-2xl mx-auto">
                Our AI code reviewer seamlessly integrates with any GitHub repository to provide deep architectural analysis, security vulnerability scanning, and automated refactoring across all major programming languages and modern web frameworks.
              </p>
            </div>

            <div className="mt-24 text-left border-t border-white/10 pt-16 max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-white mb-12 text-center tracking-tight">Frequently Asked Questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-3">How does the AI repository analysis work?</h3>
                  <p className="text-zinc-400 leading-relaxed">GitRepoAnalyzer uses advanced large language models to scan your GitHub repository's codebase. It analyzes the file structure, dependencies, and code logic to generate a comprehensive overview of the architecture, identify potential security vulnerabilities, and suggest actionable code improvements.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-3">Is my code secure when using GitRepoAnalyzer?</h3>
                  <p className="text-zinc-400 leading-relaxed">Yes, your code's security is our priority. We only access public repositories or repositories you explicitly provide access to. The code is processed securely in memory for analysis and is not stored permanently or used to train our models without your consent.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-3">Can it automatically fix the code issues it finds?</h3>
                  <p className="text-zinc-400 leading-relaxed">Absolutely. Our "Automated Code Fixes" feature not only identifies bugs and anti-patterns but also generates the exact code needed to resolve them. You can easily copy these fixes or generate a git patch to apply them directly to your repository.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-3">What languages and frameworks are supported?</h3>
                  <p className="text-zinc-400 leading-relaxed">GitRepoAnalyzer supports a wide array of modern programming languages and frameworks, including JavaScript, TypeScript, Python, React, Node.js, Go, Rust, and many more. The AI is trained on diverse codebases, allowing it to understand and analyze almost any tech stack.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-3">Can I export the analysis results?</h3>
                  <p className="text-zinc-400 leading-relaxed">Yes, you can export the full analysis, including the architecture diagram and security review, as a beautifully formatted PDF or Markdown file. This is perfect for sharing with your team or including in your project documentation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Comments />

        {/* Footer */}
        <footer className="bg-zinc-950 py-12 border-t border-white/10 relative z-10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="col-span-1 lg:col-span-2">
              <div className="text-xl font-black text-white mb-4">GitRepoAnalyzer</div>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                Advanced AI-powered repository analysis. Gain deep insights into your codebase, identify security vulnerabilities, and optimize your workflow with automated code fixes.
              </p>
            </div>
            <div>
              <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Resources</h2>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><button onClick={() => setShowAboutModal(true)} className="hover:text-white transition-colors">About Features</button></li>
                <li><button onClick={() => setShowBlog(true)} className="hover:text-white transition-colors">Blog & Articles</button></li>
                <li><button onClick={() => {
                  const el = document.getElementById('comments-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-white transition-colors">Community Feedback</button></li>
                <li><button onClick={() => setShowPrivacyModal(true)} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setShowCookieModal(true)} className="hover:text-white transition-colors">Cookie Policy</button></li>
                <li><button onClick={() => setShowTermsModal(true)} className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
            <div>
              <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Support</h2>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><button onClick={() => setShowFeedbackModal(true)} className="hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => setShowDonationModal(true)} className="hover:text-white transition-colors">Support & Donation</button></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 text-center text-zinc-500 text-xs">
            © {new Date().getFullYear()} GitRepoAnalyzer. All rights reserved.
          </div>
        </footer>
    </main>

      {/* Instruction Popup */}
      <AnimatePresence>
        {showInstructionPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-black/5 dark:border-white/5 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                Getting Started
              </h3>
              <div className="space-y-4 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                <p>To begin the analysis, please scroll down to select the features you want to unlock.</p>
                <p>We will verify the repository link to ensure it's accessible before starting the deep-dive analysis.</p>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowInstructionPopup(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmInstruction}
                  className="flex-1 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ClearHistoryModal
        show={showClearHistoryConfirm}
        onClose={() => setShowClearHistoryConfirm(false)}
        onConfirm={clearAllHistory}
      />
      <PopupAd 
        show={showPopupAd} 
        onClose={() => setShowPopupAd(false)} 
        text={popupAdText} 
      />
      <AdBlockerModal 
        show={showAdBlockModal} 
        onClose={() => setShowAdBlockModal(false)} 
      />

      {/* Floating Message Icon */}
      <AnimatePresence>
        {!isCommentsInView && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const el = document.getElementById('comments-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="fixed bottom-24 right-6 z-[90] p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/40 border border-indigo-500/50 hover:bg-indigo-700 transition-colors group"
            title="View Comments"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute right-full mr-4 px-3 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
              Community Feedback
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cookie Consent Banner */}
      <CookieConsent 
        show={!hasAcceptedCookies} 
        onAccept={() => {
          localStorage.setItem('repoAnalyzerCookiesAccepted', 'true');
          setHasAcceptedCookies(true);
        }}
        onShowDetails={() => setShowCookieModal(true)}
      />

      {/* Fix Mode Prompt Modal */}
      <FixPromptModal 
        isOpen={showFixPrompt}
        onClose={() => setShowFixPrompt(false)}
        onFixAndZip={async () => {
          setShowFixPrompt(false);
          const files = await generateFix();
          if (files) {
            await downloadUpdatedRepo(files);
          }
        }}
      />
      </div>
    </ErrorBoundary>
  );
}
