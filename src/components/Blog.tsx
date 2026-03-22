import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Shield, Cpu, Code, ChevronRight, Calendar, Clock, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: React.ReactNode;
  date: string;
  readTime: string;
  icon: any;
  category: string;
  author: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'code-analysis-best-practices',
    title: 'Code Analysis Best Practices for Modern Teams',
    excerpt: 'Discover how to integrate static and dynamic code analysis into your CI/CD pipeline to catch bugs early.',
    category: 'Best Practices',
    date: '2023-10-15',
    readTime: '5 min read',
    author: 'Git Repo Analyzer Team',
    icon: Code,
    content: (
      <article className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p className="text-lg">Static code analysis is a cornerstone of modern software development. By analyzing source code without executing it, teams can identify potential vulnerabilities, code smells, and anti-patterns early in the development lifecycle.</p>
        
        <section>
          <h3 className="text-2xl font-black mt-8 mb-4 text-zinc-900 dark:text-white">1. Integrate Early and Often</h3>
          <p>The best time to catch a bug is before it merges. Integrate tools like <a href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Git Repo Analyzer</a> directly into your pull request workflow. Automated checks ensure that no code is merged without meeting your quality standards.</p>
        </section>

        <section>
          <h3 className="text-2xl font-black mt-8 mb-4 text-zinc-900 dark:text-white">2. Focus on Actionable Metrics</h3>
          <p>Don't get bogged down by thousands of low-priority warnings. Configure your analysis tools to focus on critical security vulnerabilities and high-impact maintainability issues. Our <a href="/#features" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Automated Code Fixes</a> feature helps prioritize and resolve these issues instantly.</p>
        </section>

        <section>
          <h3 className="text-2xl font-black mt-8 mb-4 text-zinc-900 dark:text-white">3. Educate the Team</h3>
          <p>Code analysis isn't just about finding bugs; it's a learning tool. Use the findings to educate developers on secure coding practices and architectural patterns. Generating <a href="/#docs" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Project Documentation</a> automatically can help onboard new team members faster.</p>
        </section>
      </article>
    )
  },
  {
    id: 'security-vulnerabilities-owasp',
    title: 'Understanding the OWASP Top 10 Security Vulnerabilities',
    excerpt: 'A deep dive into the most critical security risks facing web applications today and how to mitigate them.',
    category: 'Security',
    date: '2023-11-02',
    readTime: '8 min read',
    author: 'Security Research Team',
    icon: Shield,
    content: (
      <article className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p className="text-lg">Security is not an afterthought. The OWASP Top 10 represents a broad consensus about the most critical security risks to web applications. Understanding these vulnerabilities is the first step to securing your codebase.</p>
        
        <section>
          <h3 className="text-2xl font-black mt-8 mb-4 text-zinc-900 dark:text-white">Injection Flaws</h3>
          <p>Injection flaws, such as SQL, NoSQL, OS, and LDAP injection, occur when untrusted data is sent to an interpreter as part of a command or query. Always use parameterized queries and validate input to prevent these attacks.</p>
        </section>

        <section>
          <h3 className="text-2xl font-black mt-8 mb-4 text-zinc-900 dark:text-white">Broken Authentication</h3>
          <p>Application functions related to authentication and session management are often implemented incorrectly, allowing attackers to compromise passwords, keys, or session tokens. Implement multi-factor authentication and secure session handling.</p>
        </section>

        <section>
          <h3 className="text-2xl font-black mt-8 mb-4 text-zinc-900 dark:text-white">How Git Repo Analyzer Helps</h3>
          <p>Our AI-powered tool automatically performs a comprehensive <a href="/#security" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Security Review</a> of your repository. It scans for these common vulnerabilities and provides actionable fixes before your code reaches production, acting as an automated security auditor.</p>
        </section>
      </article>
    )
  },
  {
    id: 'ai-in-software-development',
    title: 'The Future of AI in Software Development',
    excerpt: 'How large language models and AI assistants are transforming the way we write, review, and maintain code.',
    category: 'AI & Tech',
    date: '2023-11-20',
    readTime: '6 min read',
    author: 'AI Engineering Team',
    icon: Cpu,
    content: (
      <article className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p className="text-lg">Artificial Intelligence is revolutionizing software engineering. From intelligent code completion to automated refactoring, AI tools are becoming indispensable for modern developers, drastically reducing time spent on boilerplate and debugging.</p>
        
        <section>
          <h3 className="text-2xl font-black mt-8 mb-4 text-zinc-900 dark:text-white">Automated Code Reviews</h3>
          <p>AI can review code faster and often more thoroughly than human reviewers, catching subtle bugs and suggesting architectural improvements based on vast datasets of open-source code. This allows human reviewers to focus on business logic and high-level design.</p>
        </section>

        <section>
          <h3 className="text-2xl font-black mt-8 mb-4 text-zinc-900 dark:text-white">Generating Documentation</h3>
          <p>One of the most tedious tasks for developers is writing documentation. AI can automatically generate comprehensive READMEs, API docs, and inline comments by analyzing the codebase. Try our <a href="/#docs" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Documentation Generator</a> to see this in action.</p>
        </section>

        <section>
          <h3 className="text-2xl font-black mt-8 mb-4 text-zinc-900 dark:text-white">The Git Repo Analyzer Advantage</h3>
          <p>Git Repo Analyzer leverages cutting-edge AI to provide deep <a href="/#architecture" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Architectural Insights</a> and automated code fixes, acting as a tireless senior engineer on your team. By understanding the context of your entire repository, it provides suggestions that are contextually aware and highly accurate.</p>
        </section>
      </article>
    )
  }
];

interface BlogProps {
  onClose: () => void;
}

export const Blog: React.FC<BlogProps> = ({ onClose }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (selectedPost) {
      document.title = `${selectedPost.title} | Git Repo Analyzer Blog`;
      
      // Update meta tags for article
      const metaOgType = document.querySelector('meta[property="og:type"]');
      if (metaOgType) metaOgType.setAttribute('content', 'article');
      
      const metaOgTitle = document.querySelector('meta[property="og:title"]');
      if (metaOgTitle) metaOgTitle.setAttribute('content', selectedPost.title);
      
      const metaOgDesc = document.querySelector('meta[property="og:description"]');
      if (metaOgDesc) metaOgDesc.setAttribute('content', selectedPost.excerpt);
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', selectedPost.excerpt);

      // Add article specific meta tags
      const articlePublishedTime = document.createElement('meta');
      articlePublishedTime.setAttribute('property', 'article:published_time');
      articlePublishedTime.setAttribute('content', new Date(selectedPost.date).toISOString());
      articlePublishedTime.id = 'meta-article-published-time';
      document.head.appendChild(articlePublishedTime);

      const articleAuthor = document.createElement('meta');
      articleAuthor.setAttribute('property', 'article:author');
      articleAuthor.setAttribute('content', selectedPost.author);
      articleAuthor.id = 'meta-article-author';
      document.head.appendChild(articleAuthor);

      const articleSection = document.createElement('meta');
      articleSection.setAttribute('property', 'article:section');
      articleSection.setAttribute('content', selectedPost.category);
      articleSection.id = 'meta-article-section';
      document.head.appendChild(articleSection);

      // Add Article JSON-LD
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'article-json-ld';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": selectedPost.title,
        "description": selectedPost.excerpt,
        "author": {
          "@type": "Organization",
          "name": selectedPost.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Git Repo Analyzer",
          "logo": {
            "@type": "ImageObject",
            "url": "https://gitrepoanalyzer.com/logo.png"
          }
        },
        "datePublished": selectedPost.date,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://gitrepoanalyzer.com/blog/${selectedPost.id}`
        }
      });
      document.head.appendChild(script);

      return () => {
        // Reset meta tags
        document.title = 'Git Repo Analyzer | AI-Powered GitHub Repository Analysis & Code Fixes';
        if (metaOgType) metaOgType.setAttribute('content', 'website');
        if (metaOgTitle) metaOgTitle.setAttribute('content', 'Git Repo Analyzer | AI-Powered GitHub Repository Analysis & Code Fixes');
        if (metaOgDesc) metaOgDesc.setAttribute('content', 'Git Repo Analyzer is the ultimate AI tool to instantly analyze GitHub repositories. Get deep architectural insights, security reviews, automated code fixes, and generate comprehensive project documentation. Boost your developer productivity today.');
        if (metaDesc) metaDesc.setAttribute('content', 'Git Repo Analyzer is the ultimate AI tool to instantly analyze GitHub repositories. Get deep architectural insights, security reviews, automated code fixes, and generate comprehensive project documentation. Boost your developer productivity today.');
        
        const jsonLdScript = document.getElementById('article-json-ld');
        if (jsonLdScript) jsonLdScript.remove();

        const publishedTime = document.getElementById('meta-article-published-time');
        if (publishedTime) publishedTime.remove();

        const author = document.getElementById('meta-article-author');
        if (author) author.remove();

        const section = document.getElementById('meta-article-section');
        if (section) section.remove();
      };
    }
  }, [selectedPost]);

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={selectedPost ? () => setSelectedPost(null) : onClose}
          className="flex items-center gap-2 text-zinc-500 hover:text-indigo-500 transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          {selectedPost ? 'Back to Blog' : 'Back to Analyzer'}
        </button>

        <AnimatePresence mode="wait">
          {selectedPost ? (
            <motion.article
              key="post"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 lg:p-12 shadow-xl border border-black/5 dark:border-white/5"
            >
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full font-bold uppercase tracking-widest">
                  {selectedPost.category}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <time dateTime={selectedPost.date}>
                    {new Date(selectedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>{selectedPost.readTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span>{selectedPost.author}</span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black mb-8 tracking-tight">{selectedPost.title}</h1>
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-black prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed">
                {selectedPost.content}
              </div>
            </motion.article>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-12">
                <h1 className="text-4xl lg:text-6xl font-black mb-4 tracking-tight">Git Repo Analyzer <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Blog</span></h1>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">Insights, best practices, and updates on AI-powered software development, code analysis, and security.</p>
              </div>

              <div className="grid gap-6">
                {BLOG_POSTS.map(post => {
                  const Icon = post.icon;
                  return (
                    <motion.div 
                      key={post.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedPost(post)}
                      className="bg-white dark:bg-zinc-900 rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-xl border border-black/5 dark:border-white/5 cursor-pointer transition-all group"
                    >
                      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors">
                          <Icon className="w-8 h-8 text-indigo-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{post.category}</span>
                            <span className="text-zinc-400 text-xs">
                              {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <h2 className="text-2xl font-black mb-2 group-hover:text-indigo-500 transition-colors">{post.title}</h2>
                          <p className="text-zinc-500 dark:text-zinc-400">{post.excerpt}</p>
                        </div>
                        <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-800 group-hover:bg-indigo-500 transition-colors shrink-0">
                          <ChevronRight className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
