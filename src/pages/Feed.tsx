import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, MessageCircle, Send, UserPlus, UserCheck, Check, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import OrganicBackground from '@/components/OrganicBackground';

interface FeedScan {
  id: string;
  food_name: string;
  verdict: string;
  reason: string;
  suggestion: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string | null;
    gender: string;
    age: number;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: { display_name: string | null };
}

export default function Feed() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<FeedScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentOpen, setCommentOpen] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFeed();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      // Load who we follow
      const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
      if (follows) setFollowing(new Set(follows.map(f => f.following_id)));
    }
  };

  const loadFeed = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: publicScans } = await supabase
        .from('scans')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!publicScans) { setLoading(false); return; }

      const userIds = [...new Set(publicScans.map(s => s.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, display_name, gender, age').in('user_id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Get likes counts
      const scanIds = publicScans.map(s => s.id);
      const { data: likes } = await supabase.from('scan_likes').select('scan_id, user_id').in('scan_id', scanIds);
      const { data: commentCounts } = await supabase.from('scan_comments').select('scan_id').in('scan_id', scanIds);

      const likesMap = new Map<string, number>();
      const userLikes = new Set<string>();
      likes?.forEach(l => {
        likesMap.set(l.scan_id, (likesMap.get(l.scan_id) || 0) + 1);
        if (user && l.user_id === user.id) userLikes.add(l.scan_id);
      });

      const commentsMap = new Map<string, number>();
      commentCounts?.forEach(c => {
        commentsMap.set(c.scan_id, (commentsMap.get(c.scan_id) || 0) + 1);
      });

      const enriched: FeedScan[] = publicScans.map(s => ({
        ...s,
        profile: profileMap.get(s.user_id) as any,
        likes_count: likesMap.get(s.id) || 0,
        comments_count: commentsMap.get(s.id) || 0,
        is_liked: userLikes.has(s.id),
      }));

      setScans(enriched);
    } catch (err) {
      console.error('Feed error:', err);
    }
    setLoading(false);
  };

  const toggleLike = async (scanId: string) => {
    if (!currentUserId) { toast.error('Sign in to like'); return; }
    const scan = scans.find(s => s.id === scanId);
    if (!scan) return;

    if (scan.is_liked) {
      await supabase.from('scan_likes').delete().eq('scan_id', scanId).eq('user_id', currentUserId);
      setScans(prev => prev.map(s => s.id === scanId ? { ...s, is_liked: false, likes_count: s.likes_count - 1 } : s));
    } else {
      await supabase.from('scan_likes').insert({ scan_id: scanId, user_id: currentUserId });
      setScans(prev => prev.map(s => s.id === scanId ? { ...s, is_liked: true, likes_count: s.likes_count + 1 } : s));
    }
  };

  const toggleFollow = async (userId: string) => {
    if (!currentUserId) { toast.error('Sign in to follow'); return; }
    if (following.has(userId)) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', userId);
      setFollowing(prev => { const n = new Set(prev); n.delete(userId); return n; });
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: userId });
      setFollowing(prev => new Set(prev).add(userId));
    }
  };

  const openComments = async (scanId: string) => {
    setCommentOpen(scanId);
    const { data } = await supabase.from('scan_comments').select('*').eq('scan_id', scanId).order('created_at', { ascending: true });
    if (data) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, display_name').in('user_id', userIds);
      const pMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setComments(data.map(c => ({ ...c, profile: pMap.get(c.user_id) as any })));
    }
  };

  const postComment = async () => {
    if (!currentUserId || !commentOpen || !commentText.trim()) return;
    const { data } = await supabase.from('scan_comments').insert({ scan_id: commentOpen, user_id: currentUserId, content: commentText.trim() }).select().single();
    if (data) {
      setComments(prev => [...prev, { ...data, profile: { display_name: 'You' } }]);
      setCommentText('');
      setScans(prev => prev.map(s => s.id === commentOpen ? { ...s, comments_count: s.comments_count + 1 } : s));
    }
  };

  const verdictConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    green: { color: 'text-safe', bg: 'bg-safe/10', icon: Check, label: '🟢 Safe' },
    yellow: { color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle, label: '🟡 Caution' },
    red: { color: 'text-danger', bg: 'bg-danger/10', icon: X, label: '🔴 Avoid' },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <OrganicBackground variant="cool" intensity="subtle" />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-14 pb-4 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/scanner')} className="w-11 h-11 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-display font-bold flex-1">Community Feed</h1>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
            </motion.div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-5xl mb-4">🌿</p>
            <p className="text-lg font-display font-semibold">No public scans yet</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to share a scan result!</p>
          </div>
        ) : (
          <div className="px-5 pb-8 space-y-5">
            {scans.map(scan => {
              const vc = verdictConfig[scan.verdict] || verdictConfig.yellow;
              return (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-glow rounded-3xl overflow-hidden"
                >
                  {/* User header */}
                  <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                    <div className="w-10 h-10 rounded-full gradient-organic flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {(scan.profile?.display_name || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{scan.profile?.display_name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(scan.created_at).toLocaleDateString()}</p>
                    </div>
                    {currentUserId && scan.user_id !== currentUserId && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleFollow(scan.user_id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          following.has(scan.user_id)
                            ? 'glass text-muted-foreground'
                            : 'gradient-organic text-primary-foreground'
                        }`}
                      >
                        {following.has(scan.user_id) ? <><UserCheck className="w-3 h-3 inline mr-1" />Following</> : <><UserPlus className="w-3 h-3 inline mr-1" />Follow</>}
                      </motion.button>
                    )}
                  </div>

                  {/* Scan result card */}
                  <div className="px-5 pb-4">
                    <div className={`${vc.bg} rounded-2xl p-5`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg">{vc.label.split(' ')[0]}</span>
                        <h3 className="font-display font-bold text-lg">{scan.food_name}</h3>
                      </div>
                      <p className="text-sm leading-relaxed">{scan.reason}</p>
                      {scan.suggestion && (
                        <p className="text-xs text-muted-foreground mt-2">💡 {scan.suggestion}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-6 px-5 pb-4">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleLike(scan.id)} className="flex items-center gap-1.5">
                      <Heart className={`w-5 h-5 ${scan.is_liked ? 'fill-danger text-danger' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">{scan.likes_count}</span>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => openComments(scan.id)} className="flex items-center gap-1.5">
                      <MessageCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{scan.comments_count}</span>
                    </motion.button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {commentOpen === scan.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/30 overflow-hidden"
                      >
                        <div className="px-5 py-4 space-y-3 max-h-60 overflow-y-auto">
                          {comments.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>
                          )}
                          {comments.map(c => (
                            <div key={c.id} className="flex gap-2">
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                                {(c.profile?.display_name || 'U')[0]}
                              </div>
                              <div>
                                <p className="text-xs font-semibold">{c.profile?.display_name || 'User'}</p>
                                <p className="text-xs text-muted-foreground">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="px-5 pb-4 flex gap-2">
                          <Input
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="rounded-full h-10 text-xs glass border-border/40"
                            onKeyDown={e => e.key === 'Enter' && postComment()}
                          />
                          <Button onClick={postComment} size="icon" className="rounded-full h-10 w-10 gradient-organic border-0">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
