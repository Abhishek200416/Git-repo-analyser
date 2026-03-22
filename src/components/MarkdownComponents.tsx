
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutTemplate, 
  Lightbulb, 
  Network, 
  ShieldAlert, 
  Bug, 
  Zap, 
  Terminal, 
  Copy,
  ExternalLink,
  Download,
  FileText,
  RotateCcw,
  Check,
  Code
} from 'lucide-react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const Mermaid = ({ chart, onNodeClick, theme }: { chart: string, onNodeClick?: (nodeId: string) => void, theme: 'dark' | 'light' }) => {
  const [svg, setSvg] = useState<string>('');
  const id = useMemo(() => `mermaid-${Math.random().toString(36).slice(2, 9)}`, []);

  const downloadSVG = () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `architecture-${id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPNG = () => {
    const container = document.getElementById(id + '-container');
    const svgElement = container?.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const bbox = svgElement.getBBox();
    const scale = 2;
    canvas.width = bbox.width * scale;
    canvas.height = bbox.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = theme === 'dark' ? '#09090b' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `architecture-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  useEffect(() => {
    const renderChart = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'base',
          securityLevel: 'loose',
        });
        const renderId = `${id}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        setSvg('<div class="text-rose-500 text-sm p-6 border border-rose-500/20 rounded-2xl bg-rose-500/10 font-medium flex items-center gap-3">Error rendering architecture diagram.</div>');
      }
    };
    renderChart();
  }, [chart, id, theme]);

  return (
    <div id={id + '-container'} className="my-10 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-sm relative group overflow-hidden">
      <TransformWrapper initialScale={1} minScale={0.1} maxScale={8} centerOnInit={true}>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-6 right-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={downloadSVG} className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-black/5 dark:border-white/5"><Download className="w-4 h-4" /></button>
              <button onClick={downloadPNG} className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-black/5 dark:border-white/5"><FileText className="w-4 h-4" /></button>
              <button onClick={() => zoomIn()} className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-black/5 dark:border-white/5">+</button>
              <button onClick={() => zoomOut()} className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-black/5 dark:border-white/5">-</button>
              <button onClick={() => resetTransform()} className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-black/5 dark:border-white/5"><RotateCcw className="w-4 h-4" /></button>
            </div>
            <TransformComponent wrapperStyle={{ width: '100%', height: '100%', minHeight: '500px' }}>
              <div className="w-full h-full flex items-center justify-center p-10 [&>svg]:max-w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export const MarkdownH2 = ({ children, ...props }: any) => {
  const text = String(children);
  let Icon = LayoutTemplate;
  if (text.includes('Details')) Icon = Lightbulb;
  if (text.includes('Architecture')) Icon = LayoutTemplate;
  if (text.includes('Diagram')) Icon = Network;
  if (text.includes('Security Analysis')) Icon = ShieldAlert;
  if (text.includes('Security Scan')) Icon = Bug;
  if (text.includes('Recommendations')) Icon = Zap;
  if (text.includes('Master Prompt')) Icon = Terminal;

  return (
    <h2 className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-3 mt-12 mb-6 text-xl lg:text-2xl font-semibold text-zinc-900 dark:text-zinc-100" {...props}>
      <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shrink-0">
        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <span className="break-words">{children}</span>
    </h2>
  );
};

export const MarkdownPre = ({ node, ...props }: any) => (
  <div className="relative group my-6 w-full max-w-full overflow-hidden">
    <pre className="bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white p-4 lg:p-5 rounded-xl border border-black/10 dark:border-white/10 overflow-x-auto shadow-sm text-xs lg:text-sm" {...props} />
    <button 
      onClick={() => {
        const text = (node as any)?.children?.[0]?.children?.[0]?.value || '';
        if (text) copyToClipboard(text);
      }}
      className="absolute top-4 right-4 p-2 bg-white dark:bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-black/10 dark:border-white/10"
    >
      <Copy className="w-4 h-4" />
    </button>
  </div>
);

export const MarkdownCode = ({ node, inline, className, children, theme, onNodeClick, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const [copied, setCopied] = useState(false);

  if (!inline && language === 'mermaid') {
    return (
      <Mermaid 
        chart={String(children).replace(/\n$/, '')} 
        theme={theme}
        onNodeClick={onNodeClick} 
      />
    );
  }

  if (!inline && language) {
    return (
      <div className="relative group my-6 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{language}</span>
          </div>
          <button 
            onClick={() => {
              copyToClipboard(String(children));
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-zinc-500"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <SyntaxHighlighter
          style={theme === 'dark' ? vscDarkPlus : prism}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            backgroundColor: theme === 'dark' ? '#09090b' : '#f8fafc',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md text-xs lg:text-sm font-mono border border-indigo-500/20" {...props}>
      {children}
    </code>
  );
};

export const MarkdownTable = ({ children }: any) => (
  <div className="my-8 w-full overflow-x-auto rounded-xl border border-black/10 dark:border-white/10 shadow-sm">
    <table className="w-full text-sm text-left border-collapse">
      {children}
    </table>
  </div>
);

export const MarkdownThead = ({ children }: any) => (
  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-black/10 dark:border-white/10">
    {children}
  </thead>
);

export const MarkdownTh = ({ children }: any) => (
  <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100 border-r border-black/5 dark:border-white/5 last:border-r-0">
    {children}
  </th>
);

export const MarkdownTd = ({ children }: any) => (
  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 border-b border-black/5 dark:border-white/5 last:border-b-0 border-r border-black/5 dark:border-white/5 last:border-r-0">
    {children}
  </td>
);

export const MarkdownTr = ({ children }: any) => (
  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors last:border-b-0">
    {children}
  </tr>
);

export const MarkdownA = ({ children, ...props }: any) => (
  <a className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline" target="_blank" rel="noopener noreferrer" {...props}>
    {children}
    <ExternalLink className="w-3 h-3" />
  </a>
);

export const extractMermaid = (markdown: string) => {
  const match = markdown.match(/```mermaid\n([\s\S]*?)```/);
  return match ? match[1] : null;
};

export const removeMermaid = (markdown: string) => {
  return markdown.replace(/```mermaid\n[\s\S]*?```/g, '');
};

export const parsePhases = (markdown: string) => {
  const phases: { title: string; content: string; score?: string }[] = [];
  const phaseRegex = /# PHASE (\d+):\s*(.*?)\s*(?=\n# PHASE \d+:|$)/gs;
  let match;

  while ((match = phaseRegex.exec(markdown)) !== null) {
    const title = `PHASE ${match[1]}: ${match[2].split('\n')[0]}`;
    const content = match[2].split('\n').slice(1).join('\n').trim();
    
    // Extract score if present (e.g., [Score: 8/10])
    const scoreMatch = content.match(/\[Score:\s*(\d+)\/10\]/i);
    const score = scoreMatch ? scoreMatch[1] : undefined;
    
    phases.push({ title, content, score });
  }

  if (phases.length === 0) {
    phases.push({ title: 'Analysis Result', content: markdown });
  }

  return phases;
};
