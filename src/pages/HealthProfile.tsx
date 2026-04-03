import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { GOALS, DIETS, CONDITIONS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Settings, Crown, ChevronRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileLayout from '@/components/MobileLayout';

export default function Profile() {
  const { profile, resetOnboarding } = useProfile();
  const navigate = useNavigate();
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase.from('scans').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
        setTotalScans(count || 0);
      }
    })();
  }, []);

  const goal = GOALS.find(g => g.value === profile.goal);
  const condition = CONDITIONS.find(c => c.value === profile.condition);
  const h = profile.heightCm || 170;
  const w = profile.weightKg || 70;
  const bmi = w / ((h / 100) ** 2);
  const bmiLabel = bmi < 18.5 ? 'Недовес' : bmi < 25 ? 'Норма' : bmi < 30 ? 'Избыток' : 'Ожирение';
  const activeDiets = (profile.diets || []).filter(d => d !== 'none');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <MobileLayout title="Профиль" variant="cool">
      <div className="pt-3 space-y-3">
        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="glass-glow rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-organic flex items-center justify-center text-2xl shadow-lg">
            {profile.gender === 'male' ? '♂' : profile.gender === 'female' ? '♀' : '⚧'}
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-lg">{profile.displayName || 'Пользователь'}</p>
            <p className="text-xs text-muted-foreground">
              {profile.gender === 'male' ? 'Муж' : profile.gender === 'female' ? 'Жен' : 'Другой'}, {profile.age} лет
            </p>
            {profile.location && <p className="text-[11px] text-muted-foreground mt-0.5">📍 {profile.location}</p>}
          </div>
        </motion.div>

        {/* Plan */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          className="glass-strong rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${profile.isPremium ? 'gradient-organic' : 'bg-muted'}`}>
                <Crown className={`w-4 h-4 ${profile.isPremium ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{profile.isPremium ? 'Премиум' : 'Бесплатный'}</p>
                <p className="text-[10px] text-muted-foreground">{totalScans} сканов</p>
              </div>
            </div>
            {!profile.isPremium && (
              <Button size="sm" onClick={() => navigate('/paywall')}
                className="rounded-xl gradient-organic border-0 text-primary-foreground text-xs h-8">
                Улучшить
              </Button>
            )}
          </div>
        </motion.div>

        {/* Body */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="glass-strong rounded-2xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Тело</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'ИМТ', value: bmi.toFixed(1), sub: bmiLabel, accent: true },
              { label: 'Рост', value: String(h), sub: 'см' },
              { label: 'Вес', value: String(w), sub: 'кг' },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground font-semibold mb-0.5">{s.label}</p>
                <p className={`text-lg font-display font-bold ${s.accent ? 'text-primary' : ''}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Condition + Goal */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}
          className="glass-strong rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Состояние</p>
            <span className="text-sm">{condition?.icon} {condition?.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Цель</p>
            <span className="text-sm">{goal?.icon} {goal?.label}</span>
          </div>
          {activeDiets.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Диеты</p>
              <div className="flex flex-wrap gap-1.5">
                {activeDiets.map(d => {
                  const diet = DIETS.find(dd => dd.value === d);
                  return (
                    <span key={d} className="px-2.5 py-1 rounded-full glass text-[11px] font-medium">
                      {diet?.icon} {diet?.label}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>

        {/* Actions */}
        <div className="space-y-1.5 pb-4">
          <Button variant="outline" onClick={() => { resetOnboarding(); navigate('/'); }}
            className="w-full rounded-2xl h-11 glass border-border/30 justify-between text-sm">
            <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Редактировать профиль</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" onClick={handleLogout}
            className="w-full rounded-2xl h-11 glass border-border/30 justify-between text-sm text-danger">
            <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Выйти</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
