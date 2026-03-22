import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { GOALS } from '@/types/profile';
import { Flame, Beef, Wheat, Droplets, TrendingUp, ArrowRight, Lightbulb, Newspaper, Check, AlertTriangle, X } from 'lucide-react';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

interface DayScan {
  id: string;
  food_name: string;
  verdict: string;
  reason: string;
  created_at: string;
}

// Rough calorie/macro estimates per scan based on verdict
const VERDICT_MACROS = {
  green: { cal: 350, protein: 25, carbs: 40, fat: 12 },
  yellow: { cal: 420, protein: 15, carbs: 55, fat: 18 },
  red: { cal: 550, protein: 10, carbs: 65, fat: 28 },
};

const GOAL_TARGETS: Record<string, { cal: number; protein: number; carbs: number; fat: number }> = {
  weight_loss: { cal: 1800, protein: 120, carbs: 150, fat: 55 },
  energy: { cal: 2200, protein: 100, carbs: 250, fat: 70 },
  recovery: { cal: 2000, protein: 130, carbs: 200, fat: 60 },
  sleep: { cal: 1900, protein: 90, carbs: 220, fat: 65 },
};

const NEXT_STEPS: Record<string, string[]> = {
  weight_loss: [
    'Добавьте 25–30 г белка в следующий приём — это продлит сытость.',
    'Не заменяйте обед батончиком — полноценная еда эффективнее.',
    'Выпейте стакан воды перед едой — снизит аппетит.',
  ],
  energy: [
    'Добавьте сложные углеводы — овсянку или гречку.',
    'Перерыв между едой > 5ч снижает энергию. Перекусите.',
    'Кофеин после 14:00 мешает вечернему восстановлению.',
  ],
  recovery: [
    'Увеличьте белок до 2 г/кг — это ускорит заживление.',
    'Добавьте омега-3: рыба, семена, авокадо.',
    'Витамин C усиливает регенерацию тканей.',
  ],
  sleep: [
    'Лёгкий ужин за 3 часа до сна — оптимально.',
    'Триптофан из индейки или бананов поможет уснуть.',
    'Магний перед сном расслабляет мышцы и нервную систему.',
  ],
};

export default function DayMode() {
  const { profile } = useProfile();
  const [dayScans, setDayScans] = useState<DayScan[]>([]);
  const [loading, setLoading] = useState(true);

  const goal = GOALS.find(g => g.value === profile.goal);
  const targets = GOAL_TARGETS[profile.goal] || GOAL_TARGETS.energy;
  const tips = NEXT_STEPS[profile.goal] || NEXT_STEPS.energy;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await supabase
          .from('scans')
          .select('id, food_name, verdict, reason, created_at')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .order('created_at', { ascending: true });
        if (data) setDayScans(data);
      }
      setLoading(false);
    })();
  }, []);

  // Calculate today's macros from scans
  const totals = dayScans.reduce((acc, s) => {
    const m = VERDICT_MACROS[s.verdict as keyof typeof VERDICT_MACROS] || VERDICT_MACROS.yellow;
    return { cal: acc.cal + m.cal, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat };
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });

  const macroBar = (current: number, target: number, label: string, icon: React.ReactNode, color: string) => {
    const pct = Math.min((current / target) * 100, 100);
    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
          </div>
          <span className="text-[10px] font-bold">{current}/{target}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
      </div>
    );
  };

  // Determine random tip for next step
  const tipIndex = dayScans.length % tips.length;

  // Detect gaps in day
  const lastMealTime = dayScans.length > 0
    ? new Date(dayScans[dayScans.length - 1].created_at)
    : null;
  const hoursSinceLastMeal = lastMealTime
    ? (Date.now() - lastMealTime.getTime()) / (1000 * 60 * 60)
    : 0;
  const hasLongGap = hoursSinceLastMeal > 4 && dayScans.length > 0;

  const verdictIcon = (v: string) => {
    if (v === 'green') return <Check className="w-3.5 h-3.5 text-safe" />;
    if (v === 'red') return <X className="w-3.5 h-3.5 text-danger" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-warning" />;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <OrganicBackground variant="warm" intensity="subtle" />
      <div className="relative z-10 px-5 pt-14">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-display font-extrabold tracking-tight">Режим дня</h1>
          <span className="px-3 py-1 rounded-xl gradient-organic text-primary-foreground text-[10px] font-bold">
            {goal?.icon} {goal?.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Живая картина вашего дня</p>

        {/* Macros Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-glow rounded-3xl p-5 mb-5"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-4">Картина дня</p>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl gradient-organic flex items-center justify-center">
              <Flame className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold">{totals.cal}</p>
              <p className="text-[10px] text-muted-foreground">из {targets.cal} ккал</p>
            </div>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totals.cal / targets.cal) * 100, 100)}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full gradient-organic"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {macroBar(totals.protein, targets.protein, 'Белок', <Beef className="w-3 h-3 text-safe" />, 'hsl(158, 64%, 38%)')}
            {macroBar(totals.carbs, targets.carbs, 'Углеводы', <Wheat className="w-3 h-3 text-warning" />, 'hsl(36, 95%, 54%)')}
            {macroBar(totals.fat, targets.fat, 'Жиры', <Droplets className="w-3 h-3 text-accent" />, 'hsl(270, 55%, 62%)')}
          </div>
        </motion.div>

        {/* Next Best Step */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-4 mb-5 flex gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1">Следующий шаг</p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {hasLongGap
                ? `Прошло ${Math.floor(hoursSinceLastMeal)}ч без еды. ${tips[tipIndex]}`
                : dayScans.length === 0
                  ? 'Начните день со скана — увидите, как каждый выбор влияет на цель.'
                  : tips[tipIndex]
              }
            </p>
          </div>
        </motion.div>

        {/* Day Timeline */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">Приёмы за день</p>
          {loading ? (
            <div className="flex justify-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent" />
              </motion.div>
            </div>
          ) : dayScans.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Нет сканов сегодня — каждый приём влияет на картину дня</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dayScans.map((scan, i) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-3 flex items-center gap-3"
                >
                  <div className="flex flex-col items-center shrink-0 w-10">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {new Date(scan.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {verdictIcon(scan.verdict)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{scan.food_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{scan.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold">
                      ~{VERDICT_MACROS[scan.verdict as keyof typeof VERDICT_MACROS]?.cal || 400} ккал
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* News Widget */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-4 flex gap-3 mb-4"
        >
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
            <Newspaper className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold">Сегодня полезно помнить</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {profile.goal === 'weight_loss' && 'Дефицит калорий работает только если вы сыты. Белок — ключ.'}
              {profile.goal === 'energy' && 'Стабильная энергия = стабильный сахар. Избегайте скачков.'}
              {profile.goal === 'recovery' && 'Сон + белок + витамин C — три столпа восстановления.'}
              {profile.goal === 'sleep' && 'Тяжёлая еда за 2ч до сна ухудшает качество отдыха на 40%.'}
            </p>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}
