import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Moon, Target, Leaf, Salad, Scale, Scan, ArrowRight, Sparkles, Crown, Info, Pencil, Check } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';

type StateKey = 'energy' | 'sleep' | 'focus' | 'calm' | 'digestion' | 'weight';

interface StateOpt {
  key: StateKey;
  labelRu: string;
  labelEn: string;
  Icon: typeof Zap;
}

const STATES: StateOpt[] = [
  { key: 'energy',    labelRu: 'Энергия',  labelEn: 'Energy',    Icon: Zap },
  { key: 'sleep',     labelRu: 'Сон',      labelEn: 'Sleep',     Icon: Moon },
  { key: 'focus',     labelRu: 'Фокус',    labelEn: 'Focus',     Icon: Target },
  { key: 'calm',      labelRu: 'Спокойн.', labelEn: 'Calm',      Icon: Leaf },
  { key: 'digestion', labelRu: 'ЖКТ',      labelEn: 'Digestion', Icon: Salad },
  { key: 'weight',    labelRu: 'Вес',      labelEn: 'Weight',    Icon: Scale },
];

// Each state maps to a "Your Next Move" hint and 3 best picks.
const NEXT_MOVE: Record<StateKey, { ru: { title: string; sub: string }; en: { title: string; sub: string } }> = {
  energy:    { ru: { title: 'Избегай провала в 15:00', sub: 'Начни с белка + воды до кофе.' },        en: { title: 'Avoid the 3 PM crash',  sub: 'Start with protein + water before coffee.' } },
  sleep:     { ru: { title: 'Готовь мозг ко сну',       sub: 'Стоп кофеин после 14:00 и тёплый ужин.' }, en: { title: 'Prime your brain for sleep', sub: 'No caffeine after 2 PM, warm dinner.' } },
  focus:     { ru: { title: 'Фокус на 90 минут',         sub: 'Белок + жиры, без сахара утром.' },     en: { title: '90-minute focus block', sub: 'Protein + fats, skip morning sugar.' } },
  calm:      { ru: { title: 'Снизь тревогу мягко',       sub: 'Магний, тёплая вода, без стимуляторов.' }, en: { title: 'Soften the anxiety',  sub: 'Magnesium, warm water, no stimulants.' } },
  digestion: { ru: { title: 'Разгрузи живот',            sub: 'Лёгкое, тёплое, медленное — без газировки.' }, en: { title: 'Ease your gut', sub: 'Light, warm, slow — no soda.' } },
  weight:    { ru: { title: 'Не сорвись на сладкое',     sub: 'Белок + клетчатка дают сытость на 4ч.' }, en: { title: 'Beat the sugar craving', sub: 'Protein + fiber keeps you full 4h.' } },
};

const PICKS: Record<StateKey, { emoji: string; titleRu: string; titleEn: string; tagRu: string; tagEn: string }[]> = {
  energy: [
    { emoji: '🥣', titleRu: 'Овсянка с орехами', titleEn: 'Oats + nuts',       tagRu: 'Белок',     tagEn: 'Protein' },
    { emoji: '🍫', titleRu: 'Тёмный шоколад',     titleEn: 'Dark chocolate',    tagRu: 'Энергия',   tagEn: 'Clean energy' },
    { emoji: '🍵', titleRu: 'Матча латте',        titleEn: 'Matcha latte',      tagRu: 'Без отката', tagEn: 'No crash' },
  ],
  sleep: [
    { emoji: '🍒', titleRu: 'Терпкая вишня',      titleEn: 'Tart cherry',       tagRu: 'Мелатонин', tagEn: 'Melatonin' },
    { emoji: '🥛', titleRu: 'Тёплое молоко',      titleEn: 'Warm milk',         tagRu: 'Триптофан', tagEn: 'Tryptophan' },
    { emoji: '🌿', titleRu: 'Ромашковый чай',     titleEn: 'Chamomile tea',     tagRu: 'Расслабл.', tagEn: 'Calming' },
  ],
  focus: [
    { emoji: '🥚', titleRu: 'Яйца + авокадо',     titleEn: 'Eggs + avocado',    tagRu: 'Холин',     tagEn: 'Choline' },
    { emoji: '🐟', titleRu: 'Лосось',              titleEn: 'Salmon',            tagRu: 'Omega-3',   tagEn: 'Omega-3' },
    { emoji: '☕', titleRu: 'Кофе + L-Theanine',  titleEn: 'Coffee + L-theanine', tagRu: 'Чистый фокус', tagEn: 'Clean focus' },
  ],
  calm: [
    { emoji: '🥑', titleRu: 'Авокадо',             titleEn: 'Avocado',           tagRu: 'Магний',    tagEn: 'Magnesium' },
    { emoji: '🍌', titleRu: 'Банан',               titleEn: 'Banana',            tagRu: 'B6',        tagEn: 'B6' },
    { emoji: '🌰', titleRu: 'Миндаль',             titleEn: 'Almonds',           tagRu: 'Спокойств.', tagEn: 'Calm' },
  ],
  digestion: [
    { emoji: '🥣', titleRu: 'Кефир',               titleEn: 'Kefir',             tagRu: 'Пробиотик', tagEn: 'Probiotic' },
    { emoji: '🥬', titleRu: 'Тушёные овощи',       titleEn: 'Stewed veggies',    tagRu: 'Лёгкое',    tagEn: 'Easy' },
    { emoji: '🫚', titleRu: 'Имбирный чай',        titleEn: 'Ginger tea',        tagRu: 'Снимает',   tagEn: 'Soothing' },
  ],
  weight: [
    { emoji: '🥗', titleRu: 'Греческий йогурт',    titleEn: 'Greek yogurt',      tagRu: 'Высок. белок', tagEn: 'High protein' },
    { emoji: '🥜', titleRu: 'Орехи',               titleEn: 'Mixed nuts',        tagRu: 'Сытость',   tagEn: 'Satiety' },
    { emoji: '🫛', titleRu: 'Хумус + овощи',       titleEn: 'Hummus + veggies',  tagRu: 'Клетчатка', tagEn: 'Fiber' },
  ],
};

const SELECTED_STATE_KEY = 'nutrisee_selected_state';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { lang, t } = useI18n();
  const [selected, setSelected] = useState<StateKey>(() => {
    const saved = localStorage.getItem(SELECTED_STATE_KEY) as StateKey | null;
    return saved && STATES.find(s => s.key === saved) ? saved : 'energy';
  });
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    localStorage.setItem(SELECTED_STATE_KEY, selected);
  }, [selected]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const name = profile.displayName || user.email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      } else if (profile.displayName) {
        setUserName(profile.displayName);
      }
    })();
  }, [profile.displayName]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (lang === 'ru') {
      if (h < 12) return 'Доброе утро';
      if (h < 18) return 'Добрый день';
      return 'Добрый вечер';
    }
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const move = NEXT_MOVE[selected][lang];
  const picks = PICKS[selected];
  const heroTitle = lang === 'ru' ? 'Что тебе нужно прямо сейчас?' : 'What do you need right now?';
  const scanTitle = lang === 'ru' ? 'Перед тем как съесть, выпить или купить.' : 'Before you eat, drink, or buy.';
  const scanSub = lang === 'ru' ? 'Еда · Напитки · БАДы' : 'Food · Drinks · Supplements';
  const scanCta = lang === 'ru' ? 'Сканировать' : 'Scan now';
  const nextMoveLabel = lang === 'ru' ? 'СЛЕДУЮЩИЙ ШАГ' : 'YOUR NEXT MOVE';
  const insightLabel = lang === 'ru' ? 'ИНСАЙТ' : 'YOUR INSIGHT';
  const insightTitle = lang === 'ru' ? 'Сладкий завтрак часто ведёт к провалу в 15:00.' : 'Sweet breakfasts often lead to your 3 PM crash.';
  const picksTitle = lang === 'ru' ? 'Лучшие варианты сейчас' : 'Best picks right now';
  const seeAll = lang === 'ru' ? 'Все' : 'See all';
  const openPlan = lang === 'ru' ? 'Открыть план дня' : 'Open day plan';

  return (
    <MobileLayout
      title=""
      hideNav={false}
      noPadding
      variant="default"
    >
      <div className="px-5 pt-3 pb-2 safe-top">
        {/* Brand row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-2xl gradient-organic flex items-center justify-center shadow-lg shadow-primary/30">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" />
              <Sparkles className="relative w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-black text-[17px] tracking-tight">NutriSee</span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground/70 mt-0.5">Bio · Intelligence</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/paywall')}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full overflow-hidden active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, hsl(45 95% 60% / 0.18), hsl(36 92% 56% / 0.10))',
              border: '1px solid hsl(45 95% 60% / 0.4)',
            }}
          >
            <Crown className="w-3 h-3" style={{ color: 'hsl(42 95% 55%)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'hsl(42 90% 50%)' }}>
              {lang === 'ru' ? 'Премиум' : 'Premium'}
            </span>
          </button>
        </div>

        {/* Greeting */}
        <p className="text-[13px] text-muted-foreground mb-1.5 font-medium">
          {greeting}{userName ? `, ` : ''}<span className="text-foreground font-semibold">{userName}</span> 👋
        </p>
        <h1 className="font-display font-black text-[30px] leading-[1.02] tracking-[-0.02em] mb-1">
          {heroTitle}
        </h1>
        <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent mb-5" />

        {/* State chips - horizontal scroll */}
        <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-1 w-max">
            {STATES.map(s => {
              const isActive = selected === s.key;
              const Icon = s.Icon;
              return (
                <motion.button
                  key={s.key}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelected(s.key)}
                  className={`relative flex flex-col items-center justify-center gap-1.5 w-[72px] h-[82px] rounded-2xl transition-all overflow-hidden ${
                    isActive
                      ? 'text-primary-foreground shadow-xl shadow-primary/30'
                      : 'glass border border-border/30 text-foreground/80'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(145deg, hsl(var(--primary)), hsl(var(--ring)))',
                  } : undefined}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                  )}
                  <Icon className={`relative w-[18px] h-[18px] ${isActive ? 'text-primary-foreground' : 'text-primary/80'}`} strokeWidth={2.2} />
                  <span className="relative text-[10.5px] font-semibold tracking-tight leading-none">
                    {lang === 'ru' ? s.labelRu : s.labelEn}
                  </span>
                  {isActive && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white/80" />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Scan hero card - premium dark */}
        <motion.button
          whileTap={{ scale: 0.985 }}
          onClick={() => navigate('/scanner')}
          className="relative w-full mt-4 rounded-[28px] overflow-hidden text-left p-6 min-h-[210px]"
          style={{
            background: 'linear-gradient(155deg, hsl(220 35% 12%) 0%, hsl(var(--primary) / 0.85) 60%, hsl(var(--ring)) 100%)',
            boxShadow: '0 20px 50px -12px hsl(var(--primary) / 0.45), 0 8px 24px -8px hsl(var(--background)), inset 0 1px 0 hsl(0 0% 100% / 0.08)',
          }}
        >
          {/* Aurora layers */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl" style={{ background: 'hsl(var(--glow) / 0.5)' }} />
          <div className="absolute -left-10 -bottom-12 w-48 h-48 rounded-full blur-3xl" style={{ background: 'hsl(var(--glow-warm) / 0.35)' }} />
          {/* Grain / sheen */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
          }} />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-1 rounded-full bg-white/70" />
              <span className="text-white/80 text-[10px] font-bold tracking-[0.28em] uppercase">
                {lang === 'ru' ? 'Сканер биодействия' : 'Bio-action scanner'}
              </span>
            </div>
            <h2 className="font-display font-black text-[26px] text-white leading-[1.05] tracking-[-0.02em] max-w-[260px] mb-2">
              {scanTitle}
            </h2>
            <p className="text-white/65 text-[12px] mb-6 font-medium tracking-wide">{scanSub}</p>

            <div className="mt-auto inline-flex items-center gap-2.5 pl-5 pr-1.5 py-1.5 rounded-full bg-white shadow-2xl w-fit">
              <Scan className="w-4 h-4 text-foreground" strokeWidth={2.4} />
              <span className="text-[13px] font-bold text-foreground pr-1 tracking-tight">{scanCta}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--ring)))',
              }}>
                <ArrowRight className="w-4 h-4 text-primary-foreground" strokeWidth={2.6} />
              </div>
            </div>
          </div>
        </motion.button>

        {/* Next move + Insight row */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Your Next Move - mostik to plan */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/intensive')}
            className="relative text-left rounded-2xl p-4 flex flex-col gap-2.5 overflow-hidden border border-border/40"
            style={{
              background: 'linear-gradient(160deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.7) 100%)',
              boxShadow: '0 8px 24px -12px hsl(var(--background)), inset 0 1px 0 hsl(0 0% 100% / 0.04)',
            }}
          >
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl" style={{ background: 'hsl(var(--glow-warm) / 0.18)' }} />
            <div className="relative flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-[0.22em] text-primary uppercase">{nextMoveLabel}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsl(var(--glow-warm) / 0.25), hsl(var(--glow-warm) / 0.08))',
                border: '1px solid hsl(var(--glow-warm) / 0.3)',
              }}>
                <Zap className="w-3.5 h-3.5" style={{ color: 'hsl(var(--glow-warm))' }} strokeWidth={2.4} />
              </div>
            </div>
            <h3 className="relative font-display font-bold text-[15px] leading-[1.15] tracking-tight">{move.title}</h3>
            <p className="relative text-[11px] text-muted-foreground leading-snug">{move.sub}</p>
            <div className="relative mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
              {openPlan}
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.button>

          {/* Insight card */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl p-4 flex flex-col gap-2 overflow-hidden border border-border/40"
            style={{
              background: 'linear-gradient(160deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.7) 100%)',
              boxShadow: '0 8px 24px -12px hsl(var(--background)), inset 0 1px 0 hsl(0 0% 100% / 0.04)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-[0.22em] text-primary uppercase">{insightLabel}</span>
              <Info className="w-3.5 h-3.5 text-muted-foreground/70" />
            </div>
            <p className="text-[12.5px] font-semibold leading-snug text-foreground tracking-tight">{insightTitle}</p>
            {/* Mini sparkline */}
            <svg viewBox="0 0 120 40" className="w-full h-9 mt-auto">
              <defs>
                <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,30 Q20,28 30,22 T60,8 T90,18 T120,30 L120,40 L0,40 Z" fill="url(#spark)" />
              <path d="M0,30 Q20,28 30,22 T60,8 T90,18 T120,30" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <circle cx="60" cy="8" r="3.5" fill="hsl(var(--glow-warm))" />
              <circle cx="60" cy="8" r="6" fill="hsl(var(--glow-warm))" opacity="0.25" />
            </svg>
            <div className="flex justify-between text-[9px] text-muted-foreground/80 -mt-1 font-medium">
              <span>6 AM</span><span>12</span><span className="font-bold" style={{ color: 'hsl(var(--glow-warm))' }}>3 PM</span><span>6 PM</span>
            </div>
          </motion.div>
        </div>

        {/* Best picks */}
        <div className="flex items-end justify-between mt-6 mb-3">
          <div>
            <span className="block text-[9px] font-bold tracking-[0.25em] text-muted-foreground uppercase mb-0.5">
              {lang === 'ru' ? 'Подобрано для тебя' : 'Curated for you'}
            </span>
            <h3 className="font-display font-black text-[18px] tracking-[-0.01em]">{picksTitle}</h3>
          </div>
          <button
            onClick={() => navigate('/intensive')}
            className="flex items-center gap-1 text-[11px] text-primary font-bold active:opacity-70 pb-1"
          >
            {seeAll} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 pb-3 w-max">
            <AnimatePresence mode="popLayout">
              {picks.map((p, i) => (
                <motion.button
                  key={`${selected}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/scanner')}
                  className="relative w-[156px] rounded-2xl overflow-hidden text-left border border-border/40"
                  style={{
                    background: 'linear-gradient(165deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.75) 100%)',
                    boxShadow: '0 8px 22px -14px hsl(var(--background)), inset 0 1px 0 hsl(0 0% 100% / 0.04)',
                  }}
                >
                  <div className="relative h-24 flex items-center justify-center text-[44px] overflow-hidden" style={{
                    background: 'radial-gradient(circle at 50% 60%, hsl(var(--glow-warm) / 0.2), hsl(var(--card) / 0) 70%), linear-gradient(145deg, hsl(var(--muted) / 0.5), hsl(var(--card) / 0.3))',
                  }}>
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                      backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
                      backgroundSize: '4px 4px',
                    }} />
                    <span className="relative drop-shadow-sm">{p.emoji}</span>
                  </div>
                  <div className="p-3 pt-2.5">
                    <p className="text-[13px] font-bold leading-tight mb-2 line-clamp-2 min-h-[2.4em] tracking-tight">
                      {lang === 'ru' ? p.titleRu : p.titleEn}
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{
                      background: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                      border: '1px solid hsl(var(--primary) / 0.2)',
                    }}>
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {lang === 'ru' ? p.tagRu : p.tagEn}
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
