import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Trash2, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  Plus,
  Image as ImageIcon,
  X,
  Star
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

interface Comment {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  content: string;
  rating?: number;
  imageUrl?: string;
  sessionId?: string;
  createdAt: any;
  repoUrl?: string;
}

interface CommentsProps {
  adBlockDetected: boolean;
}

export const Comments: React.FC<CommentsProps> = ({ adBlockDetected }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState('');
  const [guestName, setGuestName] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myCommentIds, setMyCommentIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('repoAnalyzerMyComments');
    return saved ? JSON.parse(saved) : [];
  });
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('repoAnalyzerSessionId');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('repoAnalyzerSessionId', id);
    }
    return id;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('repoAnalyzerMyComments', JSON.stringify(myCommentIds));
  }, [myCommentIds]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const commentsData: Comment[] = [];
      snapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(commentsData);
    }, (err) => {
      console.error("Firestore Error:", err);
      setError("Failed to load comments. Please check your connection.");
    });

    return () => {
      unsubscribeAuth();
      unsubscribeComments();
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // ~800KB limit for Firestore document size
      setError("Image is too large. Please select an image under 800KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError("Failed to sign in with Google.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adBlockDetected) return;
    if (!newComment.trim() && !imageUrl) return;
    if (!user) {
      setError("Please sign in to post a comment.");
      return;
    }

    try {
      setNewComment('');
      setRating(5);
      setImageUrl('');
      setGuestName('');
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await addDoc(collection(db, 'comments'), {
        uid: user.uid,
        userName: user.displayName || 'Developer',
        userEmail: user.email || 'anonymous@gitrepoanalyzer.com',
        userPhoto: user.photoURL || null,
        content: newComment.trim(),
        rating: rating,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to post comment. Please try again.");
    }
  };

  const handleDelete = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    const isOwner = user && comment?.uid === user.uid;
    const isAdmin = user?.email === 'abhishek20040916@gmail.com';

    if (!isOwner && !isAdmin) {
      setError("You can only delete your own comments.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment.");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <section id="comments-section" className="max-w-4xl mx-auto px-6 py-20 border-t border-black/5 dark:border-white/5">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <MessageSquare className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Comment Us</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm tracking-widest uppercase">Join the conversation</p>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
        >
          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {!user ? (
              <div className="mb-8 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-xl text-center">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">Sign in to Comment</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 font-medium">Join our community of developers and share your feedback.</p>
                <button
                  onClick={handleGoogleSignIn}
                  className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 mx-auto uppercase tracking-widest text-xs shadow-lg"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/5 shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                         <ShieldCheck className="w-3 h-3 text-emerald-500" />
                         <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Signed in as {user.displayName || user.email}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleSignOut}
                        className="text-[9px] text-zinc-400 hover:text-rose-500 font-bold uppercase tracking-widest transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={adBlockDetected ? "Ad blocker detected. Please disable it to comment." : "Share your thoughts..."}
                      disabled={adBlockDetected}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 rounded-2xl p-3 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none h-20 font-medium text-sm"
                    />
                    
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            disabled={adBlockDetected}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star 
                              className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {imageUrl && (
                      <div className="mt-2 relative inline-block">
                        <img src={imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-black/10 dark:border-white/10" />
                        <button 
                          type="button"
                          onClick={() => setImageUrl('')}
                          disabled={adBlockDetected}
                          className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={adBlockDetected}
                          className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                          title="Add Image"
                        >
                          <Plus className="w-4 h-4" />
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest hidden sm:flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          {user.displayName || user.email}
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={adBlockDetected || (!newComment.trim() && !imageUrl)}
                        className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 uppercase tracking-widest text-[10px] shadow-lg"
                      >
                        Post
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 font-medium italic text-sm">
                  No comments yet. Be the first to start the conversation!
                </div>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-black/5 dark:border-white/5 group relative"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/5 shadow-sm shrink-0">
                        {comment.userPhoto ? (
                          <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-tight">{comment.userName}</h4>
                              {comment.rating && (
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-2.5 h-2.5 ${i < comment.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                          {(user && (user.uid === comment.uid || user?.email === 'abhishek20040916@gmail.com')) && (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium text-xs leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        {comment.imageUrl && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-black/5 dark:border-white/5 max-w-sm">
                            <img 
                              src={comment.imageUrl} 
                              alt="Comment attachment" 
                              className="w-full h-auto object-contain max-h-64 bg-zinc-100 dark:bg-zinc-900"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
