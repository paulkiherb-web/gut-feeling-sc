import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { GOALS } from '@/types/profile';
import { Flame, Beef, Wheat, Droplets, Lightbulb, Newspaper, Check, AlertTriangle, X, ArrowRight, TrendingDown, Zap, Clock, Utensils } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';

interface DayScan {
  id: string; food_name: string; verdict: string; reason: string; created_at: string;
}

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
  weight_loss: ['Добавьте 25–30 г белка — продлит сытость.', 'Не заменяйте обед батончиком.', 'Стакан воды перед едой снизит аппетит.'],
  energy: ['Добавьте сложные углеводы — овсянку или гречку.', 'Перерыв > 5ч снижает энергию.', 'Кофеин после 14:00 мешает восстановлению.'],
  recovery: ['Увеличьте белок до 2 г/кг.', 'Добавьте омега-3: рыба, авокадо.', 'Витамин C усиливает регенерацию.'],
  sleep: ['Лёгкий ужин за 3 часа до сна.', 'Триптофан из индейки поможет уснуть.', 'Магний перед сном расслабляет.'],
};

const NEWS_SIGNALS: Record<string, string[]> = {
  weight_loss: ['Дефицит калорий работает только если вы сыты.', 'Клетчатка замедляет всасывание сахара.', 'Белок по утрам снижает переедание вечером.'],
  energy: ['Стабильная энергия = стабильный сахар.', 'Обезвоживание на 2% снижает когнитивную функцию.', 'Магний участвует в 300+ процессах.'],
  recovery: ['Сон + белок + вит. C — три столпа восстановления.', 'Omega-3 снижает воспаление.', 'Цинк ускоряет заживление на 30%.'],
  sleep: ['Тяжёлая еда за 2ч до сна ухудшает отдых на 40%.', 'Регулярный ритм сна важнее длительности.', 'Магний + глицин расслабляют мышцы.'],
};

export default function DayMode() {
  const { profile } = useProfile();
  const [dayScans, setDayScans] = useState<DayScan[]>([]);
  const [loading, setLoading] = useState(true);

  const goal = GOALS.find(g => g.value === profile.goal);
  const targets = GOAL_TARGETS[profile.goal] || GOAL_TARGETS.energy;
  const tips = NEXT_STEPS[profile.goal] || NEXT_STEPS.energy;
  const signals = NEWS_SIGNALS[profile.goal] || NEWS_SIGNALS.energy;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await supabase.from('scans')
          .select('id, food_name, verdict, reason, created_at')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .order('created_at', { ascending: true });
        if (data) setDayScans(data);
      }
      setLoading(false);
    })();
  }, []);

  const totals = dayScans.reduce((acc, s) => {
    const m = VERDICT_MACROS[s.verdict as keyof typeof VERDICT_MACROS] || VERDICT_MACROS.yellow;
    return { cal: acc.cal + m.cal, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat };
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });

  // Meal rhythm analysis
  const lastMealTime = dayScans.length > 0 ? new Date(dayScans[dayScans.length - 1].created_at) : null;
  const hoursSinceLastMeal = lastMealTime ? Math.round((Date.now() - lastMealTime.getTime()) / 3600000 * 10) / 10 : 0;
  const mealGapWarning = hoursSinceLastMeal > 5;

  // Deviations — human-readable, not boring tables
  const deviations: string[] = [];
  if (dayScans.length > 0) {
    const proteinPct = totals.protein / targets.protein;
    const carbsPct = totals.carbs / targets.carbs;
    const fatPct = totals.fat / targets.fat;
    if (proteinPct < 0.3 && dayScans.length >= 2) deviations.push('Белок отстаёт — энергия может проседать');
    if (carbsPct > 0.8 && proteinPct < 0.5) deviations.push('Много углеводов, мало белка');
    if (fatPct > 0.9) deviations.push('Жиры у потолка — следующий приём обезжиренный');
    const redCount = dayScans.filter(s => s.verdict === 'red').length;
    if (redCount >= 2) deviations.push(`${redCount} красных выбора — компенсируйте зелёным`);
    if (mealGapWarning) deviations.push(`Перерыв ${hoursSinceLastMeal}ч — длинный разрыв снижает метаболизм`);
  }

  const tipIndex = dayScans.length % tips.length;

  const verdictIcon = (v: string) => v === 'green' ? <Check className="w-3.5 h-3.5 text-safe" /> : v === 'red' ? <X className="w-3.5 h-3.5 text-danger" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning" />;

  const scanImpact = (scan: DayScan) => {
    const m = VERDICT_MACROS[scan.verdict as keyof typeof VERDICT_MACROS] || VERDICT_MACROS.yellow;
    return scan.verdict === 'green' ? `+${m.protein}г белка · усиливает цель`
      : scan.verdict === 'red' ? `+${m.carbs}г быстрых углеводов · ослабляет`
      : `~${m.cal} ккал · нейтральный эффект`;
  };

  const macroBar = (current: number, target: number, label: string, icon: React.ReactNode, color: string) => {
    const pct = Math.min((current / target) * 100, 100);
    const isOver = pct >= 90;
    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">{icon}<span className="text-[9px] font-bold text-muted-foreground">{label}</span></div>
          <span className={`text-[9px] font-bold ${isOver ? 'text-danger' : ''}`}>{current}/{target}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: isOver ? 'hsl(var(--danger))' : color }} />
        </div>
      </div>
    );
  };

  return (
    <MobileLayout
      title="Режим дня"
      subtitle="Живая картина вашего дня"
      variant="warm"
      headerRight={
        <span className="px-2.5 py-1 rounded-lg gradient-organic text-primary-foreground text-[10px] font-bold shadow-sm">
          {goal?.icon} {goal?.label}
        </span>
      }
    >
      <div className="pt-3 space-y-3">
        {/* Day picture — not a boring table */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-premium rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">Картина дня</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl gradient-organic flex items-center justify-center shadow-lg glow-primary">
              <Flame className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-display font-bold tracking-tight">{totals.cal}</p>
              <p className="text-[10px] text-muted-foreground">из {targets.cal} ккал</p>
            </div>
            {/* Meal rhythm */}
            {lastMealTime && (
              <div className="glass rounded-xl px-2.5 py-1.5 text-center">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className={`text-xs font-bold ${mealGapWarning ? 'text-danger' : 'text-foreground'}`}>
                    {hoursSinceLastMeal}ч
                  </span>
                </div>
                <p className="text-[8px] text-muted-foreground mt-0.5">с еды</p>
              </div>
            )}
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((totals.cal / targets.cal) * 100, 100)}%` }}
              transition={{ duration: 1 }} className="h-full rounded-full gradient-organic" />
          </div>
          <div className="flex gap-3">
            {macroBar(totals.protein, targets.protein, 'Белок', <Beef className="w-3 h-3 text-safe" />, 'hsl(158, 64%, 38%)')}
            {macroBar(totals.carbs, targets.carbs, 'Углев.', <Wheat className="w-3 h-3 text-warning" />, 'hsl(36, 95%, 54%)')}
            {macroBar(totals.fat, targets.fat, 'Жиры', <Droplets className="w-3 h-3 text-glow-soft" />, 'hsl(270, 55%, 62%)')}
          </div>
        </motion.div>

        {/* Deviations — where the day drifts from goal */}
        {deviations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-premium rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 mb-0.5">
              <TrendingDown className="w-4 h-4 text-danger" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Где день уходит от цели</p>
            </div>
            {deviations.map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-danger/60 mt-1.5 shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">{d}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Next best step — actionable advice */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-premium rounded-2xl p-4 flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 glow-primary">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Следующий лучший шаг</p>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              {dayScans.length === 0 ? 'Начните со скана — увидите, как выбор влияет на цель.' : tips[tipIndex]}
            </p>
          </div>
        </motion.div>

        {/* Meals timeline — scan impact on day */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">Приёмы пищи</p>
          {loading ? (
            <div className="flex justify-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent" />
              </motion.div>
            </div>
          ) : dayScans.length === 0 ? (
            <div className="glass-premium rounded-2xl p-5 text-center">
              <Utensils className="w-8 h-8 text-muted-foreground/20 mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">Нет сканов сегодня — отсканируйте приём пищи</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {dayScans.map((scan, i) => (
                <motion.div key={scan.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }} className="glass-premium rounded-2xl p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col items-center shrink-0 w-9">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {new Date(scan.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {verdictIcon(scan.verdict)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{scan.food_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{scan.reason}</p>
                    </div>
                    <span className="text-[10px] font-bold shrink-0">
                      ~{VERDICT_MACROS[scan.verdict as keyof typeof VERDICT_MACROS]?.cal || 400} ккал
                    </span>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-border/10 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground">{scanImpact(scan)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* News signals — contextual to goal + day */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-premium rounded-2xl p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg gradient-glass-cool flex items-center justify-center shrink-0">
              <Newspaper className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs font-bold">Сегодня полезно помнить</p>
          </div>
          <div className="space-y-1.5">
            {signals.slice(0, Math.min(dayScans.length >= 2 ? 3 : 1, signals.length)).map((s, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Zap className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
