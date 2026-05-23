import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { GOALS, DIETS, CONDITIONS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Crown, ChevronRight, LogOut, Check, X, Pencil, Palette, Languages, Plus, Bell, Moon, Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { requestNotificationPermission, REMINDER_PLAN } from '@/hooks/useDayReminders';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';

type EditField = 'name' | 'age' | 'gender' | 'height' | 'weight' | 'goal' | 'condition' | 'diets' | 'location' | 'customCondition' | null;

const trimWords = (s: string, max = 3) => s.trim().split(/\s+/).filter(Boolean).slice(0, max).join(' ');

export default function Profile() {
  const { profile, updateProfile } = useProfile();
  const { t, lang, setLang } = useI18n();
  const { themeId, setTheme, themes } = useTheme();
  const navigate = useNavigate();
  const [totalScans, setTotalScans] = useState(0);
  const [editing, setEditing] = useState<EditField>(null);
  const [draft, setDraft] = useState('');
  const [customMode, setCustomMode] = useState(!!profile.customCondition);
  const [customDraft, setCustomDraft] = useState(profile.customCondition || '');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase.from('scans').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
        setTotalScans(count || 0);
      }
    })();
  }, []);

  const h = profile.heightCm || 170;
  const w = profile.weightKg || 70;
  const bmi = w / ((h / 100) ** 2);
  const bmiLabel = bmi < 18.5 ? t('profile.bmi.under') : bmi < 25 ? t('profile.bmi.normal') : bmi < 30 ? t('profile.bmi.over') : t('profile.bmi.obese');

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
    toast.success(t('common.update'));
  };

  const saveCustomCondition = () => {
    const trimmed = trimWords(customDraft, 3);
    if (trimmed) {
      updateProfile({ customCondition: trimmed });
      toast.success(t('common.update'));
    } else {
      updateProfile({ customCondition: undefined });
      setCustomMode(false);
    }
    setCustomDraft(trimmed);
  };

  const clearCustomCondition = () => {
    updateProfile({ customCondition: undefined });
    setCustomDraft('');
    setCustomMode(false);
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
    <MobileLayout title={t('profile.title')} variant="cool">
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
                <p className="font-display font-bold text-lg">{profile.displayName || t('profile.user')}</p>
                <Pencil className="w-3 h-3 text-muted-foreground/40" />
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              {profile.gender === 'male' ? t('onb.gender.male') : profile.gender === 'female' ? t('onb.gender.female') : t('onb.gender.other')}, {profile.age}
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
                <p className="font-semibold text-sm">{profile.isPremium ? t('profile.plan.premium') : t('profile.plan.free')}</p>
                <p className="text-[10px] text-muted-foreground">{totalScans} {t('profile.scans')}</p>
              </div>
            </div>
            {!profile.isPremium && (
              <Button size="sm" onClick={() => navigate('/paywall')}
                className="rounded-xl gradient-organic border-0 text-primary-foreground text-xs h-8">
                {t('profile.upgrade')}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Appearance: Theme + Language */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
          className="glass-strong rounded-2xl p-4 space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Palette className="w-3 h-3" /> {t('profile.appearance')}
          </p>

          {/* Language */}
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Languages className="w-3 h-3" /> {t('profile.language')}
            </p>
            <div className="flex gap-1.5">
              {(['ru', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`flex-1 px-3 py-2 rounded-xl text-[11px] font-bold tap-card transition-all uppercase ${
                    lang === l ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
                  }`}>
                  {l === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5">{t('profile.theme')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {themes.map(th => {
                const isActive = themeId === th.id;
                return (
                  <button key={th.id} onClick={() => { setTheme(th.id); toast.success(t('common.update')); }}
                    className={`flex items-center gap-2 p-2 rounded-xl tap-card transition-all ${
                      isActive ? 'border-2 border-primary glass-strong' : 'border-2 border-transparent glass'
                    }`}>
                    <div className="flex -space-x-1.5 shrink-0">
                      {th.swatch.map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full border border-background"
                          style={{ background: `hsl(${c})` }} />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold flex-1 text-left truncate">
                      {lang === 'ru' ? th.nameRu : th.name}
                    </span>
                    {isActive && <Check className="w-3 h-3 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Body */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="glass-strong rounded-2xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">{t('profile.body')}</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: t('profile.bmi'), value: bmi.toFixed(1), sub: bmiLabel, accent: true },
              { label: t('profile.height'), value: String(h), sub: lang === 'ru' ? 'см' : 'cm' },
              { label: t('profile.weight'), value: String(w), sub: lang === 'ru' ? 'кг' : 'kg' },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground font-semibold mb-0.5">{s.label}</p>
                <p className={`text-lg font-display font-bold ${s.accent ? 'text-primary' : ''}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="space-y-0.5 border-t border-border/10 pt-2">
            <EditableRow label={t('profile.age')} value={`${profile.age}`} field="age" currentRaw={String(profile.age)} />
            <EditableRow label={t('profile.height')} value={`${h} ${lang === 'ru' ? 'см' : 'cm'}`} field="height" currentRaw={String(h)} />
            <EditableRow label={t('profile.weight')} value={`${w} ${lang === 'ru' ? 'кг' : 'kg'}`} field="weight" currentRaw={String(w)} />
            <EditableRow label={t('profile.location')} value={profile.location || t('profile.no_location')} field="location" currentRaw={profile.location || ''} />
          </div>
        </motion.div>

        {/* Goal + Condition + Diets */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}
          className="glass-strong rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">{t('profile.goal')}</p>
            <div className="flex flex-wrap gap-1.5">
              {GOALS.map(g => (
                <button key={g.value} onClick={() => { updateProfile({ goal: g.value }); toast.success(t('common.update')); }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium tap-card transition-all ${
                    profile.goal === g.value ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
                  }`}>
                  {g.icon} {t(`goal.${g.value}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">{t('profile.condition')}</p>
            <div className="flex flex-wrap gap-1.5">
              {CONDITIONS.map(c => {
                const isActive = !profile.customCondition && profile.condition === c.value;
                return (
                  <button key={c.value} onClick={() => { updateProfile({ condition: c.value, customCondition: undefined }); setCustomMode(false); setCustomDraft(''); toast.success(t('common.update')); }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium tap-card transition-all ${
                      isActive ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
                    }`}>
                    {c.icon} {t(`cond.${c.value}`)}
                  </button>
                );
              })}

              {/* Custom condition */}
              {!customMode && !profile.customCondition && (
                <button onClick={() => setCustomMode(true)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium glass text-muted-foreground tap-card flex items-center gap-1">
                  <Plus className="w-3 h-3" /> {t('common.your_own')}
                </button>
              )}
              {(customMode || profile.customCondition) && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  profile.customCondition ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass'
                }`}>
                  <span className="text-[11px]">✍️</span>
                  <input
                    value={customDraft}
                    onChange={e => setCustomDraft(trimWords(e.target.value, 3))}
                    onBlur={saveCustomCondition}
                    onKeyDown={e => { if (e.key === 'Enter') { saveCustomCondition(); (e.target as HTMLInputElement).blur(); } }}
                    placeholder={t('onb.condition.placeholder')}
                    autoFocus={customMode && !profile.customCondition}
                    className={`bg-transparent outline-none text-[11px] font-semibold w-32 placeholder:font-normal ${
                      profile.customCondition ? 'text-primary-foreground placeholder:text-primary-foreground/60' : 'placeholder:text-muted-foreground'
                    }`}
                  />
                  {profile.customCondition && (
                    <button onClick={clearCustomCondition} className="p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">{t('profile.diets')}</p>
            <div className="flex flex-wrap gap-1.5">
              {DIETS.filter(d => d.value !== 'none').map(d => {
                const isActive = (profile.diets || []).includes(d.value);
                return (
                  <button key={d.value} onClick={() => {
                    const current = profile.diets || [];
                    const updated = isActive ? current.filter(x => x !== d.value) : [...current.filter(x => x !== 'none'), d.value];
                    updateProfile({ diets: updated.length ? updated : ['none'] as any });
                    toast.success(t('common.update'));
                  }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium tap-card transition-all ${
                      isActive ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
                    }`}>
                    {d.icon} {t(`diet.${d.value}`)}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Gender */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="glass-strong rounded-2xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">{t('profile.gender')}</p>
          <div className="flex gap-1.5">
            {([['male', t('profile.gender.m')], ['female', t('profile.gender.f')], ['other', t('profile.gender.o')]] as const).map(([val, label]) => (
              <button key={val} onClick={() => { updateProfile({ gender: val as any }); toast.success(t('common.update')); }}
                className={`flex-1 px-3 py-2 rounded-xl text-[11px] font-medium tap-card transition-all ${
                  profile.gender === val ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Rest window + Notifications */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="glass-strong rounded-2xl p-4 space-y-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Moon className="w-3 h-3" /> Окно отдыха и пуши
          </p>

          {/* Rest window */}
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5">Не беспокоить (сон)</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 glass rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">с</span>
                <input
                  type="time"
                  value={profile.restStart || '23:00'}
                  onChange={e => { updateProfile({ restStart: e.target.value }); }}
                  className="bg-transparent outline-none text-sm font-semibold text-right w-20"
                />
              </div>
              <div className="flex-1 glass rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">до</span>
                <input
                  type="time"
                  value={profile.restEnd || '07:00'}
                  onChange={e => { updateProfile({ restEnd: e.target.value }); }}
                  className="bg-transparent outline-none text-sm font-semibold text-right w-20"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-1.5">В это время пуши не приходят.</p>
          </div>

          {/* Push toggle */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/10">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Bell className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Пуши по плану дня</p>
                <p className="text-[10px] text-muted-foreground">Вода · еда · активность ({REMINDER_PLAN.length} в день)</p>
              </div>
            </div>
            <Switch
              checked={!!profile.notificationsEnabled}
              onCheckedChange={async (v) => {
                if (v) {
                  const ok = await requestNotificationPermission();
                  if (!ok) { toast.error('Разрешите уведомления в настройках браузера'); return; }
                  updateProfile({ notificationsEnabled: true, notificationsSound: profile.notificationsSound ?? true });
                  toast.success('Пуши включены ✅');
                } else {
                  updateProfile({ notificationsEnabled: false });
                }
              }}
            />
          </div>

          {/* Sound toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {profile.notificationsSound ? <Volume2 className="w-4 h-4 text-accent shrink-0" /> : <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-semibold">Звук уведомлений</p>
                <p className="text-[10px] text-muted-foreground">Мягкий сигнал вместе с пушем</p>
              </div>
            </div>
            <Switch
              checked={!!profile.notificationsSound}
              disabled={!profile.notificationsEnabled}
              onCheckedChange={(v) => updateProfile({ notificationsSound: v })}
            />
          </div>
        </motion.div>

        {/* Logout */}
        <div className="pb-4">
          <Button variant="outline" onClick={handleLogout}
            className="w-full rounded-2xl h-11 glass border-border/30 justify-between text-sm text-danger">
            <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> {t('profile.logout')}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
