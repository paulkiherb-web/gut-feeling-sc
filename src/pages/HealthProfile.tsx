import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { GOALS, DIETS, CONDITIONS } from '@/types/profile';
import type { Goal, Diet, Condition, Gender } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Crown, ChevronRight, LogOut, Check, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';

type EditField = 'name' | 'age' | 'gender' | 'height' | 'weight' | 'goal' | 'condition' | 'diets' | 'location' | null;

export default function Profile() {
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [totalScans, setTotalScans] = useState(0);
  const [editing, setEditing] = useState<EditField>(null);
  const [draft, setDraft] = useState('');

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

  const startEdit = (field: EditField, currentValue: string) => {
    setEditing(field);
    setDraft(currentValue);
  };

  const saveField = () => {
    if (!editing) return;
    switch (editing) {
      case 'name': updateProfile({ displayName: draft }); break;
      case 'age': { const n = parseInt(draft); if (n > 0 && n < 150) updateProfile({ age: n }); break; }
      case 'height': { const n = parseInt(draft); if (n > 50 && n < 300) updateProfile({ heightCm: n }); break; }
      case 'weight': { const n = parseFloat(draft); if (n > 10 && n < 500) updateProfile({ weightKg: n }); break; }
      case 'location': updateProfile({ location: draft }); break;
    }
    setEditing(null);
    toast.success('Сохранено');
  };

  const EditableRow = ({ label, value, field, currentRaw }: { label: string; value: string; field: EditField; currentRaw: string }) => (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      {editing === field ? (
        <div className="flex items-center gap-1.5">
          <input value={draft} onChange={e => setDraft(e.target.value)}
            className="bg-transparent border-b border-primary text-sm text-right w-24 outline-none"
            autoFocus onKeyDown={e => e.key === 'Enter' && saveField()} />
          <button onClick={saveField} className="p-1 rounded-lg bg-safe/10"><Check className="w-3.5 h-3.5 text-safe" /></button>
          <button onClick={() => setEditing(null)} className="p-1 rounded-lg bg-danger/10"><X className="w-3.5 h-3.5 text-danger" /></button>
        </div>
      ) : (
        <button onClick={() => startEdit(field, currentRaw)} className="flex items-center gap-1.5 tap-card">
          <span className="text-sm font-medium">{value}</span>
          <Pencil className="w-3 h-3 text-muted-foreground/40" />
        </button>
      )}
    </div>
  );

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
            {editing === 'name' ? (
              <div className="flex items-center gap-1.5">
                <input value={draft} onChange={e => setDraft(e.target.value)}
                  className="bg-transparent border-b border-primary font-display font-bold text-lg outline-none w-full"
                  autoFocus onKeyDown={e => e.key === 'Enter' && saveField()} />
                <button onClick={saveField} className="p-1 rounded-lg bg-safe/10"><Check className="w-3.5 h-3.5 text-safe" /></button>
              </div>
            ) : (
              <button onClick={() => startEdit('name', profile.displayName || '')} className="flex items-center gap-1.5 tap-card">
                <p className="font-display font-bold text-lg">{profile.displayName || 'Пользователь'}</p>
                <Pencil className="w-3 h-3 text-muted-foreground/40" />
              </button>
            )}
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

        {/* Body — inline editable */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="glass-strong rounded-2xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Тело</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
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
          <div className="space-y-0.5 border-t border-border/10 pt-2">
            <EditableRow label="Возраст" value={`${profile.age} лет`} field="age" currentRaw={String(profile.age)} />
            <EditableRow label="Рост" value={`${h} см`} field="height" currentRaw={String(h)} />
            <EditableRow label="Вес" value={`${w} кг`} field="weight" currentRaw={String(w)} />
            <EditableRow label="Локация" value={profile.location || 'Не указана'} field="location" currentRaw={profile.location || ''} />
          </div>
        </motion.div>

        {/* Condition + Goal — selectable */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}
          className="glass-strong rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Цель</p>
            <div className="flex flex-wrap gap-1.5">
              {GOALS.map(g => (
                <button key={g.value} onClick={() => { updateProfile({ goal: g.value }); toast.success('Цель обновлена'); }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium tap-card transition-all ${
                    profile.goal === g.value ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
                  }`}>
                  {g.icon} {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Состояние</p>
            <div className="flex flex-wrap gap-1.5">
              {CONDITIONS.map(c => (
                <button key={c.value} onClick={() => { updateProfile({ condition: c.value }); toast.success('Состояние обновлено'); }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium tap-card transition-all ${
                    profile.condition === c.value ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
                  }`}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Диеты</p>
            <div className="flex flex-wrap gap-1.5">
              {DIETS.filter(d => d.value !== 'none').map(d => {
                const isActive = (profile.diets || []).includes(d.value);
                return (
                  <button key={d.value} onClick={() => {
                    const current = profile.diets || [];
                    const updated = isActive ? current.filter(x => x !== d.value) : [...current.filter(x => x !== 'none'), d.value];
                    updateProfile({ diets: updated.length ? updated : ['none'] as any });
                    toast.success(isActive ? 'Диета убрана' : 'Диета добавлена');
                  }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium tap-card transition-all ${
                      isActive ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
                    }`}>
                    {d.icon} {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Gender */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="glass-strong rounded-2xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Пол</p>
          <div className="flex gap-1.5">
            {([['male', '♂ Мужской'], ['female', '♀ Женский'], ['other', '⚧ Другой']] as const).map(([val, label]) => (
              <button key={val} onClick={() => { updateProfile({ gender: val }); toast.success('Пол обновлён'); }}
                className={`flex-1 px-3 py-2 rounded-xl text-[11px] font-medium tap-card transition-all ${
                  profile.gender === val ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <div className="pb-4">
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
