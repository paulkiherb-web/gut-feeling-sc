import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Check, AlertTriangle, X, Calendar } from 'lucide-react';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

interface ScanItem {
  id: string;
  food_name: string;
  verdict: string;
  reason: string;
  created_at: string;
}

export default function History() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('scans')
        .select('id, food_name, verdict, reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setScans(data);
    }
    setLoading(false);
  };

  // Daily compliance: % of green scans today
  const today = new Date().toISOString().slice(0, 10);
  const todayScans = scans.filter(s => s.created_at.slice(0, 10) === today);
  const greenCount = todayScans.filter(s => s.verdict === 'green').length;
  const complianceScore = todayScans.length > 0 ? Math.round((greenCount / todayScans.length) * 100) : 0;

  const verdictIcon = (v: string) => {
    if (v === 'green') return <Check className="w-4 h-4 text-safe" />;
    if (v === 'red') return <X className="w-4 h-4 text-danger" />;
    return <AlertTriangle className="w-4 h-4 text-warning" />;
  };

  const verdictBg = (v: string) => {
    if (v === 'green') return 'bg-safe/10';
    if (v === 'red') return 'bg-danger/10';
    return 'bg-warning/10';
  };

  const timeStr = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const dateStr = (d: string) => {
    const date = new Date(d);
    const t = new Date().toISOString().slice(0, 10);
    const ds = d.slice(0, 10);
    if (ds === t) return 'Today';
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (ds === y) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group by date
  const grouped = scans.reduce<Record<string, ScanItem[]>>((acc, s) => {
    const key = s.created_at.slice(0, 10);
    (acc[key] = acc[key] || []).push(s);
    return acc;
  }, {});

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (complianceScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <OrganicBackground variant="cool" intensity="subtle" />
      <div className="relative z-10 px-5 pt-14">
        <h1 className="text-2xl font-display font-extrabold tracking-tight mb-6">History</h1>

        {/* Daily Compliance Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-glow rounded-3xl p-6 mb-6 flex items-center gap-6"
        >
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(155 72% 40%)" />
                  <stop offset="100%" stopColor="hsl(200 50% 45%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-bold text-primary">{complianceScore}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Daily Score</p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {todayScans.length === 0 
                ? 'No scans today — start scanning!'
                : `${greenCount} of ${todayScans.length} scans are safe`
              }
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
            </motion.div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-display font-bold text-lg mb-1">No scans yet</p>
            <p className="text-sm text-muted-foreground">Scan your first food to see it here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items], gi) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  {dateStr(items[0].created_at)}
                </p>
                <div className="space-y-2">
                  {items.map((scan, i) => (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: gi * 0.05 + i * 0.03 }}
                      className="glass-strong rounded-2xl p-4 flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-xl ${verdictBg(scan.verdict)} flex items-center justify-center shrink-0`}>
                        {verdictIcon(scan.verdict)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{scan.food_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{scan.reason}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{timeStr(scan.created_at)}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
