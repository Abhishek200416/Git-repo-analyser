import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, ChevronRight, Calendar, Clock, User, Zap } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../blog-data';

export default function Blog({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (!show) {
      setSelectedPost(null);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/90"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-7xl h-full max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {selectedPost ? (
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {selectedPost ? 'Reading Article' : 'Engineering Blog'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {selectedPost ? selectedPost.category : 'Insights from the GitRepoAnalyzer Team'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
          >
            <Zap className="w-6 h-6 rotate-45" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedPost ? (
              <motion.div
                key="post-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
                      {selectedPost.category}
                    </span>
                    <span className="text-zinc-400 text-sm font-medium flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                    {selectedPost.title}
                  </h1>
                  <div className="flex items-center gap-6 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-black/5 dark:border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                      {selectedPost.author[0]}
                    </div>
                    <div>
                      <div className="text-zinc-900 dark:text-white font-bold">{selectedPost.author}</div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-sm flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Author</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {selectedPost.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  {selectedPost.content}
                </div>
                <div className="mt-16 pt-8 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:gap-4 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to all articles
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="post-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
              >
                {BLOG_POSTS.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="group text-left p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-black/5 dark:border-white/5 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-zinc-800/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-black/5 dark:border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                        <post.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-indigo-500 transition-colors">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-6 flex-1 relative z-10 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5 mt-auto relative z-10">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
