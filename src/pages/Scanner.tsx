import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import type { ScanResult, Verdict } from '@/types/profile';
import { CONDITIONS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';
import { Scan, Upload, User, X, Check, AlertTriangle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import OrganicBackground from '@/components/OrganicBackground';

export default function Scanner() {
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imageBase64) {
      toast.error('Please upload a food photo first');
      return;
    }
    if (!profile.isPremium && profile.dailyScansUsed >= 3) {
      toast.error('Daily scan limit reached. Upgrade to Premium!');
      return;
    }
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
          image: imageBase64,
          user_profile: {
            age: profile.age,
            gender: profile.gender,
            condition: profile.condition,
            goal: profile.goal,
            surgery_days: profile.surgeryDays,
          },
        },
      });
      if (error) throw error;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const scanResult: ScanResult = {
        id: crypto.randomUUID(),
        foodName: parsed.food_name || 'Unknown',
        verdict: (parsed.verdict?.toLowerCase() || 'yellow') as Verdict,
        reason: parsed.reason || 'Analysis complete',
        suggestion: parsed.suggestion,
        createdAt: new Date().toISOString(),
      };
      setResult(scanResult);
      setDrawerOpen(true);
      setRecentScans(prev => [scanResult, ...prev].slice(0, 3));
      updateProfile({ dailyScansUsed: profile.dailyScansUsed + 1 });
    } catch (err) {
      console.error('Scan error:', err);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const verdictConfig = {
    green: { color: 'text-safe', bg: 'bg-safe/10', icon: Check, label: 'Safe for you' },
    yellow: { color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle, label: 'Use caution' },
    red: { color: 'text-danger', bg: 'bg-danger/10', icon: X, label: 'Avoid this' },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <OrganicBackground variant="default" intensity="subtle" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-14 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold tracking-tight">GreenRed AI</h2>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-full glass flex items-center justify-center"
          >
            <User className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Context Switcher */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CONDITIONS.map(c => (
            <motion.button
              key={c.value}
              whileTap={{ scale: 0.96 }}
              onClick={() => updateProfile({ condition: c.value })}
              className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                profile.condition === c.value
                  ? 'gradient-organic text-primary-foreground shadow-md'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {c.icon} {c.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-72 h-72 mb-8">
          {/* Animated glow ring */}
          <motion.div
            className="absolute -inset-3 rounded-3xl opacity-30"
            style={{ background: 'linear-gradient(135deg, hsl(155 72% 40%), hsl(200 50% 45%))' }}
            animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Corner accents */}
          {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-10 h-10`}>
              <div className="w-full h-0.5 bg-primary/60 rounded-full" />
              <div className="h-full w-0.5 bg-primary/60 rounded-full" />
            </div>
          ))}

          {/* Image area */}
          <div className="absolute inset-3 rounded-2xl overflow-hidden glass flex items-center justify-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Food" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Scan className="w-14 h-14 text-primary/30 mx-auto mb-3" />
                </motion.div>
                <p className="text-sm text-muted-foreground">Upload a photo to scan</p>
              </div>
            )}
            {scanning && (
              <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm">
                <motion.div
                  className="absolute left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(155 72% 40%), transparent)' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl h-14 px-6 glass border-border/40"
          >
            <Upload className="w-5 h-5 mr-2" /> Upload
          </Button>
          <Button
            onClick={handleScan}
            disabled={scanning || !imageBase64}
            className="rounded-2xl h-14 px-8 text-base font-semibold gradient-organic border-0 shadow-lg glow-primary"
          >
            {scanning ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Scan className="w-5 h-5" />
              </motion.div>
            ) : (
              <><Scan className="w-5 h-5 mr-2" /> Scan</>
            )}
          </Button>
        </div>
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="relative z-10 px-6 pb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">Recent</p>
          <div className="flex gap-3">
            {recentScans.map(s => {
              const vc = verdictConfig[s.verdict];
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 p-4 rounded-2xl glass"
                >
                  <div className={`w-3 h-3 rounded-full ${s.verdict === 'green' ? 'bg-safe' : s.verdict === 'yellow' ? 'bg-warning' : 'bg-danger'} mb-2`} />
                  <p className="text-xs font-medium truncate">{s.foodName}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="rounded-t-3xl border-border/30">
          {result && (() => {
            const vc = verdictConfig[result.verdict];
            const Icon = vc.icon;
            return (
              <div className="px-6 pb-8">
                <DrawerHeader className="px-0">
                  <div className="flex flex-col items-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className={`w-20 h-20 rounded-full ${vc.bg} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`w-10 h-10 ${vc.color}`} />
                    </motion.div>
                    <DrawerTitle className="text-xl font-display">{result.foodName}</DrawerTitle>
                    <DrawerDescription className={`text-sm font-medium ${vc.color} mt-1`}>
                      {vc.label}
                    </DrawerDescription>
                  </div>
                </DrawerHeader>

                <div className="glass-strong rounded-2xl p-5 mb-4">
                  <p className="text-sm leading-relaxed">{result.reason}</p>
                </div>

                {result.suggestion && (
                  <div className="glass-strong rounded-2xl p-5 flex gap-3">
                    <Lightbulb className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Better try</p>
                      <p className="text-sm">{result.suggestion}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full rounded-2xl h-14 mt-6 text-base font-semibold gradient-organic border-0 shadow-lg"
                >
                  Scan Another
                </Button>
              </div>
            );
          })()}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
