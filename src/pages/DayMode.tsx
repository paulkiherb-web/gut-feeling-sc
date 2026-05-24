import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import { useProfile } from '@/hooks/useProfile';
import { GOALS } from '@/types/profile';
import DailyStateCard from '@/components/day/DailyStateCard';
import DailyHydrationCard from '@/components/day/DailyHydrationCard';
import DailyNutritionCard from '@/components/day/DailyNutritionCard';
import DailyRecommendationsCard from '@/components/day/DailyRecommendationsCard';
import DailyScoreCard from '@/components/day/DailyScoreCard';
import { useAppStore } from '@/core/store/appStore';

// DayMode is now a thin UI layer over the unified store.
// All numbers come from snapshot/scores/recommendations.

export default function DayMode() {
  const { profile, updateProfile } = useProfile();
  const setGoals = useAppStore(s => s.setGoals);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(profile.dayGoal || '');

  const profileGoal = GOALS.find(g => g.value === profile.goal);
  const hasCustomGoal = (profile.dayGoal || '').trim().length > 0;

  const saveDayGoal = () => {
    const trimmed = goalInput.trim();
    updateProfile({ dayGoal: trimmed });
    setGoals({ dayGoal: trimmed });
    setEditingGoal(false);
  };

  return (
    <MobileLayout
      title="Режим дня"
      subtitle="Живая картина состояния"
      variant="warm"
      headerRight={
        <button onClick={() => { setGoalInput(profile.dayGoal || ''); setEditingGoal(true); }}
          className="px-2.5 py-1 rounded-lg gradient-organic text-primary-foreground text-[10px] font-bold shadow-sm flex items-center gap-1 active:scale-95 transition-transform">
          {hasCustomGoal
            ? `🎯 ${profile.dayGoal!.slice(0, 16)}${(profile.dayGoal!.length > 16) ? '…' : ''}`
            : `${profileGoal?.icon || '⚡'} ${profileGoal?.label || 'Энергия'}`}
          <Pencil className="w-2.5 h-2.5 opacity-70" />
        </button>
      }
    >
      <div className="pt-3 space-y-3">
        <AnimatePresence>
          {editingGoal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setEditingGoal(false)}>
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-full max-w-md glass-strong rounded-t-3xl p-5 pb-8 space-y-3"
                onClick={e => e.stopPropagation()}>
                <p className="text-sm font-display font-bold">Цель на сегодня</p>
                <p className="text-[10px] text-muted-foreground">Напишите свою цель на день — любую.</p>
                <input
                  autoFocus value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveDayGoal()}
                  placeholder="Моя цель на сегодня..."
                  className="w-full px-4 py-3 rounded-xl glass border border-border/20 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-2">
                  {profile.dayGoal && (
                    <button onClick={() => { updateProfile({ dayGoal: '' }); setGoals({ dayGoal: '' }); setEditingGoal(false); }}
                      className="px-4 py-2.5 rounded-xl text-xs text-danger font-medium active:scale-95 transition-transform">
                      Сбросить
                    </button>
                  )}
                  <button onClick={saveDayGoal}
                    className="flex-1 px-4 py-2.5 rounded-xl gradient-organic text-primary-foreground text-sm font-bold active:scale-95 transition-transform shadow-sm">
                    Сохранить
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <DailyStateCard />
        <DailyHydrationCard />
        <DailyNutritionCard />
        <DailyRecommendationsCard />
        <DailyScoreCard />
      </div>
    </MobileLayout>
  );
}
