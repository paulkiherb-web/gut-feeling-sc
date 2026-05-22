import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { GOALS } from '@/types/profile';
import { Sun, CloudSun, Moon, CheckCircle2, Circle, Sparkles, Zap, ChevronDown, RefreshCw, Trophy, Info, Target, Compass, Pencil, Check, X, Dumbbell, Activity } from 'lucide-react';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { useI18n } from '@/contexts/I18nContext';
import ProtocolDetailsDrawer from '@/components/ProtocolDetailsDrawer';

type Depth = 'soft' | 'balanced' | 'intense';
type DayPhase = 'morning' | 'day' | 'evening';
type Target = 'day' | 'long' | 'base';
type Kind = 'habit' | 'supplement' | 'workout' | 'meal' | 'recovery';

interface ProtocolItem {
  id: string;
  time: string;
  title: string;
  description: string;
  phase: DayPhase;
  depths: Depth[];
  target: Target;       // tied to today's goal, long-term, or base habit
  kind: Kind;
  duration?: string;    // e.g. "30 мин"
  easyAlt?: string;
  newsSignal?: string;
}

// Goal-specific protocols. Soft = habits/meals only. Balanced = + standard supplements + light cardio.
// Intense = + advanced supplement stack + strength/HIIT.
const PROTOCOLS: Record<string, ProtocolItem[]> = {
  energy: [
    // Base / morning
    { id: 'e1', time: '06:30', title: 'Стакан воды + лимон', description: 'Запускает метаболизм', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'habit', easyAlt: 'Просто стакан тёплой воды' },
    { id: 'e2', time: '07:00', title: 'Утренний свет 10 мин', description: 'Синхронизирует циркадный ритм', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'habit', duration: '10 мин', easyAlt: '5 мин у окна', newsSignal: 'Утренний свет повышает энергию на 40%' },
    { id: 'e3', time: '07:30', title: 'Завтрак: белок + углеводы', description: 'Яйца, овсянка, авокадо — 30г белка', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'meal' },
    // Standard supplements
    { id: 'e4', time: '08:00', title: 'Стек: Omega-3 + D3 + Mg', description: 'Базовые добавки с жирами для усвоения', phase: 'morning', depths: ['balanced', 'intense'], target: 'long', kind: 'supplement', newsSignal: 'D3 усваивается с жирами — принимайте за едой' },
    // Advanced stack
    { id: 'e5', time: '08:15', title: 'Продвинутый стек: CoQ10 + L-Carnitine + B-complex', description: 'Митохондриальная поддержка и энергообмен', phase: 'morning', depths: ['intense'], target: 'long', kind: 'supplement', newsSignal: 'CoQ10 повышает митохондриальную функцию у людей 40+' },
    // Cardio (balanced)
    { id: 'e6', time: '09:00', title: 'Кардио: быстрая ходьба', description: 'Зона 2 — лёгкое кардио, можно говорить', phase: 'morning', depths: ['balanced'], target: 'day', kind: 'workout', duration: '20 мин' },
    // Strength + HIIT (intense)
    { id: 'e7', time: '09:00', title: 'Силовая: full-body 4 упражнения', description: 'Присед, тяга, жим, планка — 4 круга', phase: 'morning', depths: ['intense'], target: 'long', kind: 'workout', duration: '35 мин' },
    { id: 'e8', time: '10:00', title: 'Фокус-блок 90 мин', description: 'Пик кортизола — глубокая работа', phase: 'day', depths: ['balanced', 'intense'], target: 'day', kind: 'habit', duration: '90 мин', easyAlt: '45 мин без отвлечений' },
    { id: 'e9', time: '12:00', title: 'Обед: основной приём', description: 'Максимум калорий, белок 30г+', phase: 'day', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'meal' },
    { id: 'e10', time: '14:00', title: 'Последний кофеин', description: 'После 14:00 разрушает сон', phase: 'day', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'habit' },
    { id: 'e11', time: '16:30', title: 'HIIT 4×4 мин', description: 'Тренировка митохондрий: 4 интервала по 4 мин на 90% макс. ЧСС', phase: 'day', depths: ['intense'], target: 'long', kind: 'workout', duration: '25 мин' },
    { id: 'e12', time: '17:00', title: 'Прогулка после работы', description: 'Снижает кортизол, второе окно энергии', phase: 'day', depths: ['soft', 'balanced'], target: 'day', kind: 'workout', duration: '15-30 мин', easyAlt: '10 мин прогулка' },
    { id: 'e13', time: '19:00', title: 'Лёгкий ужин', description: 'Белок + овощи, без тяжёлых углеводов', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'meal' },
    { id: 'e14', time: '20:30', title: 'Магний глицинат + L-Theanine', description: 'Расслабляет мышцы и нервную систему', phase: 'evening', depths: ['intense'], target: 'long', kind: 'supplement', newsSignal: 'L-Theanine улучшает качество сна на 24%' },
    { id: 'e15', time: '21:00', title: 'Снижение экранов', description: 'Синий свет подавляет мелатонин на 50%', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'habit', easyAlt: 'Снизить яркость' },
    { id: 'e16', time: '22:00', title: 'Отбой в одно время', description: 'Стабильное время сна', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'long', kind: 'habit' },
  ],
  weight_loss: [
    { id: 'w1', time: '07:00', title: 'Вода 500мл натощак', description: 'Метаболизм +24%', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'habit' },
    { id: 'w2', time: '07:30', title: 'Кардио натощак: ходьба', description: 'Зона 2, использует жир как топливо', phase: 'morning', depths: ['balanced'], target: 'day', kind: 'workout', duration: '30 мин', easyAlt: '15 мин ходьба' },
    { id: 'w3', time: '07:30', title: 'HIIT натощак: спринты', description: '6 спринтов по 30 сек, отдых 90 сек', phase: 'morning', depths: ['intense'], target: 'day', kind: 'workout', duration: '20 мин' },
    { id: 'w4', time: '08:30', title: 'Высокобелковый завтрак', description: '35г белка снижает аппетит на 60%', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'meal' },
    { id: 'w5', time: '09:00', title: 'Стек: Omega-3 + D3 + Хром', description: 'Стандартные добавки + контроль глюкозы', phase: 'morning', depths: ['balanced', 'intense'], target: 'long', kind: 'supplement' },
    { id: 'w6', time: '09:15', title: 'Продвинутый: Берберин + L-Carnitine + EGCG', description: 'Жиросжигание и инсулиновая чувствительность', phase: 'morning', depths: ['intense'], target: 'long', kind: 'supplement', newsSignal: 'Берберин снижает HbA1c сравнимо с метформином' },
    { id: 'w7', time: '12:00', title: 'Обед: белок + клетчатка', description: 'Замедляет всасывание, дольше насыщает', phase: 'day', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'meal' },
    { id: 'w8', time: '15:00', title: 'Перекус: орехи + яблоко', description: 'Без голода свыше 5 часов', phase: 'day', depths: ['balanced', 'intense'], target: 'base', kind: 'meal', easyAlt: 'Горсть миндаля' },
    { id: 'w9', time: '17:30', title: 'Силовая: full-body', description: 'Присед, тяга, жим, тяга к поясу — 4×8', phase: 'day', depths: ['intense'], target: 'long', kind: 'workout', duration: '45 мин' },
    { id: 'w10', time: '18:00', title: '10 000 шагов', description: 'NEAT — главный союзник дефицита', phase: 'day', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'workout', duration: '60 мин', easyAlt: '5000 шагов' },
    { id: 'w11', time: '19:00', title: 'Ужин за 3ч до сна', description: 'Рыба + зелень, мало углеводов', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'meal' },
    { id: 'w12', time: '21:30', title: 'Магний + Глицин', description: 'Качество сна = контроль аппетита завтра', phase: 'evening', depths: ['intense'], target: 'long', kind: 'supplement' },
    { id: 'w13', time: '22:00', title: 'Сон 7-8 часов', description: 'Недосып повышает грелин (голод) на 28%', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'long', kind: 'habit' },
  ],
  recovery: [
    { id: 'r1', time: '07:30', title: 'Вода + щепотка соли', description: 'Восполнение электролитов', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'habit' },
    { id: 'r2', time: '08:00', title: 'Завтрак: белок 35г+', description: 'Лейцин запускает синтез белка', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'meal' },
    { id: 'r3', time: '08:30', title: 'Стек: Коллаген + Vit C + Omega-3', description: 'Стандартные добавки для тканей', phase: 'morning', depths: ['balanced', 'intense'], target: 'long', kind: 'supplement' },
    { id: 'r4', time: '08:45', title: 'Продвинутый: Креатин + Глутамин + Куркумин', description: 'Силовое восстановление, противовоспалительное', phase: 'morning', depths: ['intense'], target: 'long', kind: 'supplement', newsSignal: 'Креатин 5г/день ускоряет восстановление мышц на 30%' },
    { id: 'r5', time: '10:00', title: 'Мобильность + растяжка', description: 'Без нагрузки, 6 паттернов', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'recovery', duration: '15 мин', easyAlt: '5 мин разминки' },
    { id: 'r6', time: '11:00', title: 'Лёгкая Z2 ходьба', description: 'Активное восстановление, кровоток', phase: 'day', depths: ['balanced'], target: 'day', kind: 'workout', duration: '30 мин' },
    { id: 'r7', time: '11:00', title: 'Силовая: лёгкая техника', description: '50% от рабочего веса, акцент на форме', phase: 'day', depths: ['intense'], target: 'day', kind: 'workout', duration: '30 мин' },
    { id: 'r8', time: '12:30', title: 'Жирная рыба + овощи', description: 'Omega-3 снижает воспаление', phase: 'day', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'meal' },
    { id: 'r9', time: '15:00', title: 'Vit C + Zinc + Magnesium', description: 'Заживление и иммунитет', phase: 'day', depths: ['balanced', 'intense'], target: 'long', kind: 'supplement', newsSignal: 'Цинк ускоряет заживление на 30%' },
    { id: 'r10', time: '17:00', title: 'Контрастный душ', description: '3 раунда: 30с холод / 60с тепло', phase: 'day', depths: ['intense'], target: 'long', kind: 'recovery', duration: '5 мин' },
    { id: 'r11', time: '19:00', title: 'Лёгкий ужин + Магний', description: 'Восстановление во сне', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'meal' },
    { id: 'r12', time: '21:30', title: 'Отбой рано', description: '8-9 часов сна для регенерации', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'long', kind: 'habit' },
  ],
  sleep: [
    { id: 's1', time: '07:00', title: 'Свет в первые 30 мин', description: 'Настраивает мелатонин на вечер', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'habit' },
    { id: 's2', time: '08:00', title: 'Завтрак с триптофаном', description: 'Индейка, бананы, орехи — сырьё для мелатонина', phase: 'morning', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'meal' },
    { id: 's3', time: '09:00', title: 'Стек: Omega-3 + D3', description: 'Стандартные добавки утром', phase: 'morning', depths: ['balanced', 'intense'], target: 'long', kind: 'supplement' },
    { id: 's4', time: '11:00', title: 'Кардио Z2: ходьба', description: 'Утомление мышц = глубже сон', phase: 'morning', depths: ['balanced'], target: 'day', kind: 'workout', duration: '30 мин' },
    { id: 's5', time: '11:00', title: 'Силовая утром', description: 'Тренировка ДО 14:00 не мешает сну', phase: 'morning', depths: ['intense'], target: 'long', kind: 'workout', duration: '40 мин' },
    { id: 's6', time: '12:00', title: 'Нормальная порция обеда', description: 'Без переедания', phase: 'day', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'meal' },
    { id: 's7', time: '14:00', title: 'Стоп кофеин', description: 'Полувыведение 5-6ч', phase: 'day', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'habit' },
    { id: 's8', time: '18:00', title: 'Прогулка вечером', description: 'Снижает кортизол перед сном', phase: 'day', depths: ['soft', 'balanced'], target: 'day', kind: 'workout', duration: '20 мин', easyAlt: '10 мин на воздухе' },
    { id: 's9', time: '19:00', title: 'Лёгкий ужин за 3ч', description: 'Вишня, рис, ромашковый чай', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'day', kind: 'meal' },
    { id: 's10', time: '20:00', title: 'Снижение экранов', description: 'Блокирует мелатонин', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'base', kind: 'habit' },
    { id: 's11', time: '20:30', title: 'Растяжка + дыхание 4-7-8', description: 'Парасимпатика — режим отдыха', phase: 'evening', depths: ['intense'], target: 'day', kind: 'recovery', duration: '15 мин' },
    { id: 's12', time: '21:00', title: 'Магний глицинат + Глицин', description: 'Стандартный сон-стек', phase: 'evening', depths: ['balanced', 'intense'], target: 'long', kind: 'supplement', newsSignal: 'Магний + глицин расслабляют мышцы за 30 мин' },
    { id: 's13', time: '21:15', title: 'Продвинутый: Apigenin + L-Theanine', description: 'Глубокий сон, протокол Huberman', phase: 'evening', depths: ['intense'], target: 'long', kind: 'supplement' },
    { id: 's14', time: '22:00', title: 'Отбой в одно время', description: 'Стабильный ритм = качественный сон', phase: 'evening', depths: ['soft', 'balanced', 'intense'], target: 'long', kind: 'habit' },
  ],
};

const PHASE_CONFIG = {
  morning: { icon: Sun, labelKey: 'intensive.morning', gradient: 'from-amber-400/15 to-orange-300/5', color: 'text-amber-500' },
  day: { icon: CloudSun, labelKey: 'intensive.day', gradient: 'from-sky-400/15 to-blue-300/5', color: 'text-sky-500' },
  evening: { icon: Moon, labelKey: 'intensive.evening', gradient: 'from-indigo-400/15 to-purple-300/5', color: 'text-indigo-400' },
};

const KIND_ICON: Record<Kind, string> = {
  habit: '✨',
  supplement: '💊',
  workout: '🏋️',
  meal: '🍽️',
  recovery: '🧘',
};

export default function Intensive() {
  const { profile, updateProfile } = useProfile();
  const { t, lang } = useI18n();
  const [depth, setDepth] = useState<Depth>('balanced');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expandedPhase, setExpandedPhase] = useState<DayPhase | null>('morning');
  const [showingEasy, setShowingEasy] = useState<Set<string>>(new Set());
  const [recapOpen, setRecapOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<ProtocolItem | null>(null);

  // Inline goals editing
  const [editingGoal, setEditingGoal] = useState<'day' | 'long' | null>(null);
  const [goalDraft, setGoalDraft] = useState('');

  const DEPTH_LABELS: Record<Depth, { label: string; desc: string; icon: string }> = {
    soft: { label: t('intensive.depth.soft'), desc: t('intensive.depth.soft.desc'), icon: '🌱' },
    balanced: { label: t('intensive.depth.balanced'), desc: t('intensive.depth.balanced.desc'), icon: '⚡' },
    intense: { label: t('intensive.depth.intense'), desc: t('intensive.depth.intense.desc'), icon: '🔥' },
  };

  const goal = GOALS.find(g => g.value === profile.goal);
  const goalLabel = goal ? t(`goal.${goal.value}`) : '';
  const allProtocols = PROTOCOLS[profile.goal] || PROTOCOLS.energy;
  const protocols = allProtocols.filter(p => p.depths.includes(depth));

  const toggleComplete = (id: string) => {
    setCompleted(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleEasy = (id: string) => {
    setShowingEasy(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    toast(t('intensive.replaced'));
  };

  const startGoalEdit = (which: 'day' | 'long') => {
    setEditingGoal(which);
    setGoalDraft((which === 'day' ? profile.dayGoal : profile.longGoal) || '');
  };

  const saveGoal = () => {
    if (!editingGoal) return;
    const trimmed = goalDraft.trim().slice(0, 120);
    if (editingGoal === 'day') updateProfile({ dayGoal: trimmed || undefined });
    else updateProfile({ longGoal: trimmed || undefined });
    setEditingGoal(null);
    toast.success(t('common.update'));
  };

  const completionRate = protocols.length > 0 ? Math.round((completed.size / protocols.length) * 100) : 0;
  const phases: DayPhase[] = ['morning', 'day', 'evening'];

  const phaseCompletion = phases.map(phase => {
    const items = protocols.filter(p => p.phase === phase);
    const done = items.filter(p => completed.has(p.id)).length;
    return { phase, total: items.length, done, pct: items.length > 0 ? Math.round((done / items.length) * 100) : 0 };
  });

  const targetTagStyle: Record<Target, string> = {
    day: 'bg-warning/15 text-warning border border-warning/30',
    long: 'bg-primary/15 text-primary border border-primary/30',
    base: 'bg-muted text-muted-foreground border border-border/40',
  };
  const targetTagLabel: Record<Target, string> = {
    day: t('intensive.tag.day'),
    long: t('intensive.tag.long'),
    base: t('intensive.tag.base'),
  };

  return (
    <MobileLayout
      title={t('intensive.title')}
      subtitle={`${goal?.icon} ${goalLabel} · ${DEPTH_LABELS[depth].icon} ${DEPTH_LABELS[depth].label}`}
      variant="warm"
      headerRight={
        <span className="px-2.5 py-1 rounded-lg gradient-deep text-primary-foreground text-[10px] font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> PRO
        </span>
      }
    >
      <div className="pt-3 space-y-3">
        {/* GOALS — free-text, inline editable */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-premium rounded-2xl p-3.5 space-y-2.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">{t('intensive.goals')}</p>

          {/* Day goal */}
          <GoalRow
            icon={<Target className="w-3.5 h-3.5 text-warning" />}
            label={t('intensive.day_goal')}
            value={profile.dayGoal}
            placeholder={t('intensive.day_goal.placeholder')}
            isEditing={editingGoal === 'day'}
            draft={goalDraft}
            setDraft={setGoalDraft}
            onStart={() => startGoalEdit('day')}
            onSave={saveGoal}
            onCancel={() => setEditingGoal(null)}
            tone="warning"
          />

          {/* Long goal */}
          <GoalRow
            icon={<Compass className="w-3.5 h-3.5 text-primary" />}
            label={t('intensive.long_goal')}
            value={profile.longGoal}
            placeholder={t('intensive.long_goal.placeholder')}
            isEditing={editingGoal === 'long'}
            draft={goalDraft}
            setDraft={setGoalDraft}
            onStart={() => startGoalEdit('long')}
            onSave={saveGoal}
            onCancel={() => setEditingGoal(null)}
            tone="primary"
          />

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{t('intensive.legend')}:</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${targetTagStyle.day}`}>{targetTagLabel.day}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${targetTagStyle.long}`}>{targetTagLabel.long}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${targetTagStyle.base}`}>{targetTagLabel.base}</span>
          </div>
        </motion.div>

        {/* Depth selector */}
        <div className="segmented-control">
          {(Object.keys(DEPTH_LABELS) as Depth[]).map(d => (
            <button key={d} onClick={() => setDepth(d)}
              className={`segmented-item ${depth === d ? 'segmented-item-active' : 'segmented-item-inactive'}`}>
              {DEPTH_LABELS[d].icon} {DEPTH_LABELS[d].label}
            </button>
          ))}
        </div>

        {/* Progress ring */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass-premium rounded-2xl p-4 flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <circle cx="24" cy="24" r="20" fill="none"
                stroke={completionRate >= 80 ? 'hsl(var(--safe))' : completionRate >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--primary))'}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - completionRate / 100)}
                className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-display font-bold">{completionRate}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{completed.size} / {protocols.length} {t('intensive.completed')}</p>
            <p className="text-[10px] text-muted-foreground">{DEPTH_LABELS[depth].desc}</p>
          </div>
          {completed.size > 0 && (
            <button onClick={() => setRecapOpen(true)} className="px-3 py-1.5 rounded-xl glass text-[10px] font-semibold tap-card">
              {t('intensive.summary')}
            </button>
          )}
        </motion.div>

        {/* Protocol phases */}
        <div className="space-y-2">
          {phases.map(phase => {
            const phaseItems = protocols.filter(p => p.phase === phase);
            if (phaseItems.length === 0) return null;
            const config = PHASE_CONFIG[phase];
            const PhaseIcon = config.icon;
            const isExpanded = expandedPhase === phase;
            const phaseCompleted = phaseItems.filter(p => completed.has(p.id)).length;

            return (
              <motion.div key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => setExpandedPhase(isExpanded ? null : phase)}
                  className={`w-full glass-premium rounded-2xl p-3.5 flex items-center gap-3 tap-card ${isExpanded ? 'rounded-b-none' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                    <PhaseIcon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold">{t(config.labelKey)}</p>
                    <p className="text-[10px] text-muted-foreground">{phaseCompleted}/{phaseItems.length} {t('intensive.completed')}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden glass rounded-2xl rounded-t-none border-t-0">
                      <div className="p-2.5 space-y-0.5">
                        {phaseItems.map(item => {
                          const isDone = completed.has(item.id);
                          const isEasy = showingEasy.has(item.id);
                          const displayItem = isEasy && item.easyAlt ? { ...item, title: item.easyAlt } : item;
                          return (
                            <div key={item.id} className="space-y-0.5">
                              <div className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-opacity ${isDone ? 'opacity-40' : ''}`}>
                                <button onClick={() => toggleComplete(item.id)} className="shrink-0 tap-card pt-0.5">
                                  {isDone
                                    ? <CheckCircle2 className="w-5 h-5 text-safe" />
                                    : <Circle className="w-5 h-5 text-muted-foreground/30" />}
                                </button>
                                <button onClick={() => setDetailsItem(displayItem)}
                                  className="flex-1 min-w-0 text-left tap-card">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[10px] font-bold text-muted-foreground w-9 shrink-0 tabular-nums">{item.time}</span>
                                    <span className="text-[13px] shrink-0">{KIND_ICON[item.kind]}</span>
                                    <p className={`text-[13px] font-medium flex-1 min-w-0 leading-snug break-words ${isDone ? 'line-through' : ''}`}>
                                      {isEasy && item.easyAlt ? item.easyAlt : item.title}
                                    </p>
                                    <Info className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                                  </div>
                                  <div className="ml-11 mt-1 flex flex-wrap items-center gap-1.5 min-w-0">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${targetTagStyle[item.target]}`}>
                                      {targetTagLabel[item.target]}
                                    </span>
                                    {item.duration && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-accent/10 text-accent border border-accent/20 inline-flex items-center gap-1 whitespace-nowrap">
                                        {item.kind === 'workout' ? <Dumbbell className="w-2.5 h-2.5" /> : <Activity className="w-2.5 h-2.5" />}
                                        {item.duration}
                                      </span>
                                    )}
                                    <p className="text-[10px] text-muted-foreground leading-snug basis-full break-words">{item.description}</p>
                                  </div>
                                  {item.easyAlt && !isDone && !isEasy && (
                                    <span onClick={(e) => { e.stopPropagation(); toggleEasy(item.id); }}
                                      className="mt-1 ml-12 inline-flex items-center gap-1 text-[10px] text-primary font-semibold cursor-pointer">
                                      <RefreshCw className="w-3 h-3" /> {t('intensive.make_easier')}
                                    </span>
                                  )}
                                </button>
                              </div>
                              {item.newsSignal && !isDone && (
                                <div className="ml-10 mr-2 mb-0.5 flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl gradient-glass-cool">
                                  <Zap className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-muted-foreground leading-relaxed">{item.newsSignal}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Quick daily recap inline */}
        {completed.size > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="glass-premium rounded-2xl p-3.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1.5">{t('intensive.day_control')}</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {completionRate >= 80 ? t('intensive.feedback.great')
                : completionRate >= 50 ? t('intensive.feedback.good')
                : t('intensive.feedback.start')}
            </p>
          </motion.div>
        )}
      </div>

      {/* Daily recap bottom sheet */}
      <Drawer open={recapOpen} onOpenChange={setRecapOpen}>
        <DrawerContent className="rounded-t-[1.75rem] border-border/10">
          <div className="px-5 pb-6 pt-1">
            <div className="flex flex-col items-center py-4">
              <Trophy className="w-10 h-10 text-warning mb-2" />
              <DrawerTitle className="text-lg font-display font-bold">{t('intensive.day_summary')}</DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground mt-1">
                {DEPTH_LABELS[depth].icon} {DEPTH_LABELS[depth].label} · {goalLabel}
              </DrawerDescription>
            </div>
            <div className="space-y-2">
              {phaseCompletion.map(pc => {
                const cfg = PHASE_CONFIG[pc.phase];
                const Icon = cfg.icon;
                return (
                  <div key={pc.phase} className="glass-premium rounded-2xl p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t(cfg.labelKey)}</p>
                      <p className="text-[10px] text-muted-foreground">{pc.done}/{pc.total}</p>
                    </div>
                    <span className={`text-sm font-display font-bold ${pc.pct >= 80 ? 'text-safe' : pc.pct >= 50 ? 'text-warning' : 'text-muted-foreground'}`}>
                      {pc.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="glass rounded-xl p-3 mt-3 text-center">
              <p className="text-sm font-semibold">
                {completionRate >= 80 ? t('intensive.recap.great') : completionRate >= 50 ? t('intensive.recap.good') : t('intensive.recap.start')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t('intensive.recap.total')}: {completionRate}%
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <ProtocolDetailsDrawer
        open={!!detailsItem}
        onOpenChange={(v) => { if (!v) setDetailsItem(null); }}
        item={detailsItem}
        goal={profile.goal}
        depth={depth}
      />
    </MobileLayout>
  );
}

// Inline goal editor row
function GoalRow({
  icon, label, value, placeholder, isEditing, draft, setDraft, onStart, onSave, onCancel, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  placeholder: string;
  isEditing: boolean;
  draft: string;
  setDraft: (s: string) => void;
  onStart: () => void;
  onSave: () => void;
  onCancel: () => void;
  tone: 'primary' | 'warning';
}) {
  const accent = tone === 'primary' ? 'border-primary/30' : 'border-warning/30';
  return (
    <div className={`glass rounded-xl p-2.5 border ${accent}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</p>
      </div>
      {isEditing ? (
        <div className="flex items-start gap-1.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 120))}
            placeholder={placeholder}
            autoFocus
            rows={2}
            className="flex-1 bg-transparent border-b border-primary text-sm outline-none resize-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSave(); } }}
          />
          <div className="flex flex-col gap-1 pt-0.5">
            <button onClick={onSave} className="p-1 rounded-lg bg-safe/15 tap-card"><Check className="w-3.5 h-3.5 text-safe" /></button>
            <button onClick={onCancel} className="p-1 rounded-lg bg-danger/15 tap-card"><X className="w-3.5 h-3.5 text-danger" /></button>
          </div>
        </div>
      ) : (
        <button onClick={onStart} className="w-full flex items-start gap-2 text-left tap-card">
          <p className={`text-sm flex-1 ${value ? 'font-semibold text-foreground' : 'text-muted-foreground italic'}`}>
            {value || placeholder}
          </p>
          <Pencil className="w-3 h-3 text-muted-foreground/50 shrink-0 mt-1" />
        </button>
      )}
    </div>
  );
}
