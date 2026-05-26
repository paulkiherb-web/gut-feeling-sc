import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, MessageCircle, Send, UserPlus, UserCheck, Check, AlertTriangle, X, TrendingUp, Flame, Clock, Sparkles, MoreHorizontal, Bookmark } from 'lucide-react';
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

type FeedTab = 'trending' | 'latest' | 'following';

const VERDICT_CONFIG: Record<string, { emoji: string; gradient: string; label: string; glow: string }> = {
  green: { emoji: '✅', gradient: 'from-emerald-500/20 to-teal-500/10', label: 'Safe', glow: 'shadow-emerald-500/20' },
  yellow: { emoji: '⚠️', gradient: 'from-amber-500/20 to-orange-500/10', label: 'Caution', glow: 'shadow-amber-500/20' },
  red: { emoji: '🚫', gradient: 'from-red-500/20 to-rose-500/10', label: 'Avoid', glow: 'shadow-red-500/20' },
};

export default function Feed() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<FeedScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FeedTab>('trending');
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

  const filteredScans = scans; // In future: filter by tab

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const tabs: { key: FeedTab; label: string; icon: any }[] = [
    { key: 'trending', label: 'Популярное', icon: Flame },
    { key: 'latest', label: 'Свежее', icon: Clock },
    { key: 'following', label: 'Подписки', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <OrganicBackground variant="cool" intensity="subtle" />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-14 pb-2">
          <div className="flex items-center gap-3 mb-5">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/scanner')} className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <ArrowLeft className="w-4.5 h-4.5" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
                Лента
                <Sparkles className="w-5 h-5 text-primary" />
              </h1>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-muted-foreground" />
            </motion.button>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 p-1 rounded-2xl glass-strong mb-4">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'gradient-organic text-primary-foreground shadow-lg'
                      : 'text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
            </motion.div>
            <p className="text-xs text-muted-foreground">Загружаю ленту…</p>
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="text-center py-20 px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 rounded-full gradient-aurora mx-auto mb-5 flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>
            <p className="text-lg font-display font-bold mb-1">Пока никто не делился сканами</p>
            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
              Здесь появятся сканы людей, которые идут по своим курсам. Поделись первым — другим будет на что опереться.
            </p>
            <Button onClick={() => navigate('/scanner')} className="mt-5 rounded-2xl gradient-organic border-0 text-primary-foreground shadow-lg">
              Сканировать
            </Button>
          </div>
        ) : (
          <div className="px-4 pb-8 space-y-4">
            <AnimatePresence>
              {filteredScans.map((scan, idx) => {
                const vc = VERDICT_CONFIG[scan.verdict] || VERDICT_CONFIG.yellow;
                return (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
                    className="rounded-[1.75rem] overflow-hidden glass-strong shadow-xl"
                  >
                    {/* User Header */}
                    <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full gradient-organic flex items-center justify-center text-sm font-bold text-primary-foreground ring-2 ring-background">
                          {(scan.profile?.display_name || 'U')[0].toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border-2 border-background ${
                          scan.verdict === 'green' ? 'bg-safe' : scan.verdict === 'red' ? 'bg-danger' : 'bg-warning'
                        }`}>
                          {vc.emoji}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{scan.profile?.display_name || 'Anonymous'}</p>
                        <p className="text-[11px] text-muted-foreground">{timeAgo(scan.created_at)} ago</p>
                      </div>
                      {currentUserId && scan.user_id !== currentUserId && (
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          onClick={() => toggleFollow(scan.user_id)}
                          className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                            following.has(scan.user_id)
                              ? 'glass text-muted-foreground border border-border/50'
                              : 'gradient-organic text-primary-foreground shadow-md'
                          }`}
                        >
                          {following.has(scan.user_id) ? (
                            <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />Вы подписаны</span>
                          ) : (
                            <span className="flex items-center gap-1"><UserPlus className="w-3 h-3" />Подписаться</span>
                          )}
                        </motion.button>
                      )}
                      <button className="text-muted-foreground/50 p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Scan Content */}
                    <div className="px-5 pb-3">
                      <div className={`bg-gradient-to-br ${vc.gradient} rounded-2xl p-4 backdrop-blur-sm border border-border/20`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                scan.verdict === 'green' ? 'bg-safe/20 text-safe' : 
                                scan.verdict === 'red' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                              }`}>
                                {vc.label}
                              </span>
                            </div>
                            <h3 className="font-display font-bold text-base mb-1.5 truncate">{scan.food_name}</h3>
                            <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">{scan.reason}</p>
                          </div>
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                            scan.verdict === 'green' ? 'bg-safe/15' : 
                            scan.verdict === 'red' ? 'bg-danger/15' : 'bg-warning/15'
                          }`}>
                            {vc.emoji}
                          </div>
                        </div>
                        {scan.suggestion && (
                          <div className="mt-3 pt-3 border-t border-border/20 flex items-start gap-2">
                            <span className="text-xs">💡</span>
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{scan.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center px-5 py-3 border-t border-border/10">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleLike(scan.id)} className="flex items-center gap-1.5 mr-5">
                        <Heart className={`w-[18px] h-[18px] transition-all ${scan.is_liked ? 'fill-danger text-danger scale-110' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-semibold ${scan.is_liked ? 'text-danger' : 'text-muted-foreground'}`}>{scan.likes_count || ''}</span>
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => openComments(scan.id)} className="flex items-center gap-1.5 mr-5">
                        <MessageCircle className="w-[18px] h-[18px] text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">{scan.comments_count || ''}</span>
                      </motion.button>
                      <div className="flex-1" />
                      <motion.button whileTap={{ scale: 0.85 }} className="text-muted-foreground">
                        <Bookmark className="w-[18px] h-[18px]" />
                      </motion.button>
                    </div>

                    {/* Comments Panel */}
                    <AnimatePresence>
                      {commentOpen === scan.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          className="border-t border-border/10 overflow-hidden"
                        >
                          <div className="px-5 py-3 space-y-3 max-h-52 overflow-y-auto no-scrollbar">
                            {comments.length === 0 && (
                              <p className="text-[11px] text-muted-foreground text-center py-3">Пока нет комментариев — будь первым.</p>
                            )}
                            {comments.map(c => (
                              <div key={c.id} className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {(c.profile?.display_name || 'U')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px]">
                                    <span className="font-semibold">{c.profile?.display_name || 'User'}</span>
                                    <span className="text-muted-foreground ml-1.5">{c.content}</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="px-5 pb-4 flex gap-2">
                            <Input
                              value={commentText}
                              onChange={e => setCommentText(e.target.value)}
                              placeholder="Добавить комментарий…"
                              className="rounded-full h-9 text-xs glass border-border/30 flex-1"
                              onKeyDown={e => e.key === 'Enter' && postComment()}
                            />
                            <Button onClick={postComment} size="icon" className="rounded-full h-9 w-9 gradient-organic border-0 shadow-md">
                              <Send className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
