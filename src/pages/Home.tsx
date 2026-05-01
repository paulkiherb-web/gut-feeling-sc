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
      <div className="px-5 pt-4 pb-2 safe-top">
        {/* Brand row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-organic flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">NutriSee</span>
          </div>
          <button
            onClick={() => navigate('/paywall')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
          >
            <Crown className="w-3 h-3" />
            {lang === 'ru' ? 'Премиум' : 'Premium'}
          </button>
        </div>

        {/* Greeting */}
        <p className="text-sm text-muted-foreground mb-1">
          👋 {greeting}{userName ? `, ` : ''}<span className="text-primary font-semibold">{userName}</span>
        </p>
        <h1 className="font-display font-extrabold text-3xl leading-[1.05] tracking-tight mb-4">
          {heroTitle}
        </h1>

        {/* State chips - horizontal scroll */}
        <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-2 w-max">
            {STATES.map(s => {
              const isActive = selected === s.key;
              const Icon = s.Icon;
              return (
                <motion.button
                  key={s.key}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelected(s.key)}
                  className={`flex flex-col items-center justify-center gap-1 w-[68px] h-[78px] rounded-2xl transition-all ${
                    isActive
                      ? 'gradient-organic text-primary-foreground shadow-lg shadow-primary/25'
                      : 'glass border border-border/40 text-foreground/70'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-primary/70'}`} />
                  <span className="text-[11px] font-semibold leading-none">
                    {lang === 'ru' ? s.labelRu : s.labelEn}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Scan hero card */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/scanner')}
          className="relative w-full mt-3 rounded-3xl overflow-hidden text-left gradient-premium p-5 min-h-[200px] shadow-xl shadow-primary/20"
        >
          {/* Decorative blobs (themed) */}
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[hsl(var(--glow))/0.25] blur-2xl" />
          <div className="absolute -right-4 bottom-0 w-32 h-32 rounded-full bg-[hsl(var(--glow-warm))/0.2] blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-primary-foreground/80 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
              <Sparkles className="w-3 h-3" />
              {lang === 'ru' ? 'Сканируй что угодно' : 'Scan anything'}
            </div>
            <h2 className="font-display font-extrabold text-2xl text-primary-foreground leading-tight max-w-[220px] mb-2">
              {scanTitle}
            </h2>
            <p className="text-primary-foreground/70 text-xs mb-5">{scanSub}</p>

            <div className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full bg-card/95 backdrop-blur shadow-md">
              <Scan className="w-4 h-4 text-foreground" />
              <span className="text-sm font-bold text-foreground pr-2">{scanCta}</span>
              <div className="w-8 h-8 rounded-full gradient-organic flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-primary-foreground" />
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
            className="text-left glass-premium rounded-2xl p-3.5 flex flex-col gap-2 active:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-[0.2em] text-primary uppercase">{nextMoveLabel}</span>
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-primary/40" />
                <span className="w-3 h-[1px] bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-bold text-base leading-tight flex-1">{move.title}</h3>
              <div className="w-8 h-8 rounded-xl bg-[hsl(var(--glow-warm))/0.2] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-[hsl(var(--glow-warm))]" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">{move.sub}</p>
            <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-organic text-primary-foreground text-[10px] font-bold w-fit">
              {openPlan}
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.button>

          {/* Insight card */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-premium rounded-2xl p-3.5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-[0.2em] text-primary uppercase">{insightLabel}</span>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold leading-snug text-foreground">{insightTitle}</p>
            {/* Mini sparkline */}
            <svg viewBox="0 0 120 40" className="w-full h-10 mt-auto">
              <defs>
                <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,30 Q20,28 30,22 T60,8 T90,18 T120,30 L120,40 L0,40 Z" fill="url(#spark)" />
              <path d="M0,30 Q20,28 30,22 T60,8 T90,18 T120,30" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <circle cx="60" cy="8" r="3" fill="hsl(var(--glow-warm))" />
            </svg>
            <div className="flex justify-between text-[9px] text-muted-foreground -mt-1">
              <span>6 AM</span><span>12</span><span className="text-[hsl(var(--glow-warm))] font-bold">3 PM</span><span>6 PM</span>
            </div>
          </motion.div>
        </div>

        {/* Best picks */}
        <div className="flex items-center justify-between mt-5 mb-2">
          <h3 className="font-display font-bold text-base">{picksTitle}</h3>
          <button
            onClick={() => navigate('/intensive')}
            className="flex items-center gap-1 text-xs text-primary font-semibold active:opacity-70"
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
                  className="w-[150px] glass-premium rounded-2xl overflow-hidden text-left active:bg-muted/30 transition-colors"
                >
                  <div className="h-20 gradient-glass-warm flex items-center justify-center text-4xl">
                    {p.emoji}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold leading-tight mb-1.5 line-clamp-2 min-h-[2.5em]">
                      {lang === 'ru' ? p.titleRu : p.titleEn}
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">
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
