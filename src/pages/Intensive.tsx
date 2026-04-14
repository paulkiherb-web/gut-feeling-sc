import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { GOALS } from '@/types/profile';
import { Sun, CloudSun, Moon, CheckCircle2, Circle, Sparkles, Zap, ChevronDown, RefreshCw, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import {
  Drawer, DrawerContent, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';

type Depth = 'soft' | 'balanced' | 'intense';
type DayPhase = 'morning' | 'day' | 'evening';

const DEPTH_LABELS: Record<Depth, { label: string; desc: string; icon: string }> = {
  soft: { label: 'Мягкий', desc: 'Лёгкие привычки', icon: '🌱' },
  balanced: { label: 'Собранный', desc: 'Оптимальный баланс', icon: '⚡' },
  intense: { label: 'Фокус', desc: 'Максимум дисциплины', icon: '🔥' },
};

interface ProtocolItem {
  id: string; time: string; title: string; description: string;
  phase: DayPhase; depths: Depth[];
  easyAlt?: string; newsSignal?: string;
}

const PROTOCOLS: Record<string, ProtocolItem[]> = {
  energy: [
    { id: '1', time: '06:30', title: 'Стакан воды + лимон', description: 'Запускает метаболизм', phase: 'morning', depths: ['soft', 'balanced', 'intense'], easyAlt: 'Просто стакан тёплой воды' },
    { id: '2', time: '07:00', title: '10 мин дыхание / прогулка', description: 'Свет утром синхронизирует ритм', phase: 'morning', depths: ['balanced', 'intense'], easyAlt: '5 мин у окна', newsSignal: 'Утренний свет повышает энергию на 40%' },
    { id: '3', time: '07:30', title: 'Завтрак: белок + углеводы', description: 'Яйца, овсянка, авокадо', phase: 'morning', depths: ['soft', 'balanced', 'intense'] },
    { id: '4', time: '08:00', title: 'Omega-3 + D3', description: 'Базовые добавки', phase: 'morning', depths: ['balanced', 'intense'], newsSignal: 'D3 усваивается с жирами — принимайте за едой' },
    { id: '5', time: '10:00', title: 'Фокус-блок 90 мин', description: 'Пик кортизола', phase: 'day', depths: ['balanced', 'intense'], easyAlt: '45 мин без отвлечений' },
    { id: '6', time: '12:00', title: 'Обед: основной приём', description: 'Макс. калорийность', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '7', time: '14:00', title: 'Последний кофеин', description: 'После 14:00 мешает сну', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '8', time: '16:00', title: 'Движение 15–30 мин', description: 'Второе окно энергии', phase: 'day', depths: ['balanced', 'intense'], easyAlt: '10 мин прогулка' },
    { id: '9', time: '19:00', title: 'Лёгкий ужин', description: 'Белок + овощи', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
    { id: '10', time: '20:30', title: 'Магний + снижение экранов', description: 'Расслабляет мышцы', phase: 'evening', depths: ['balanced', 'intense'], easyAlt: 'Снизить яркость', newsSignal: 'Синий свет подавляет мелатонин на 50%' },
    { id: '11', time: '22:00', title: 'Отбой', description: 'Стабильное время сна', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
  ],
  weight_loss: [
    { id: '1', time: '07:00', title: 'Вода 500мл натощак', description: 'Метаболизм +24%', phase: 'morning', depths: ['soft', 'balanced', 'intense'] },
    { id: '2', time: '07:30', title: 'HIIT / прогулка 20 мин', description: 'Жиросжигание', phase: 'morning', depths: ['balanced', 'intense'], easyAlt: '10 мин ходьба' },
    { id: '3', time: '08:00', title: 'Высокобелковый завтрак', description: '30г белка', phase: 'morning', depths: ['soft', 'balanced', 'intense'] },
    { id: '4', time: '12:00', title: 'Обед: белок + овощи', description: 'Клетчатка замедляет всасывание', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '5', time: '15:00', title: 'Перекус: орехи + яблоко', description: 'Без голода > 5ч', phase: 'day', depths: ['balanced', 'intense'], easyAlt: 'Горсть миндаля' },
    { id: '6', time: '18:00', title: 'Тренировка / прогулка', description: '10000 шагов', phase: 'day', depths: ['soft', 'balanced', 'intense'], easyAlt: '5000 шагов' },
    { id: '7', time: '19:00', title: 'Лёгкий ужин за 3ч до сна', description: 'Рыба + зелень', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
    { id: '8', time: '22:00', title: 'Сон 7-8 часов', description: 'Недосып повышает аппетит', phase: 'evening', depths: ['balanced', 'intense'] },
  ],
  recovery: [
    { id: '1', time: '07:30', title: 'Вода + коллаген', description: 'Восстановление тканей', phase: 'morning', depths: ['soft', 'balanced', 'intense'] },
    { id: '2', time: '08:00', title: 'Завтрак: белок 35г+', description: 'Увеличенная порция', phase: 'morning', depths: ['soft', 'balanced', 'intense'] },
    { id: '3', time: '10:00', title: 'Лёгкая мобильность', description: 'Растяжка без нагрузки', phase: 'morning', depths: ['balanced', 'intense'], easyAlt: '5 мин разминки' },
    { id: '4', time: '12:00', title: 'Жирная рыба + овощи', description: 'Omega-3 снижает воспаление', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '5', time: '15:00', title: 'Вит. C + Цинк', description: 'Заживление', phase: 'day', depths: ['balanced', 'intense'], newsSignal: 'Цинк ускоряет заживление на 30%' },
    { id: '6', time: '19:00', title: 'Лёгкий ужин + магний', description: 'Восстановление во сне', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
    { id: '7', time: '21:30', title: 'Отбой рано', description: '8-9 часов сна', phase: 'evening', depths: ['balanced', 'intense'] },
  ],
  sleep: [
    { id: '1', time: '07:00', title: 'Свет в первые 30 мин', description: 'Настраивает мелатонин', phase: 'morning', depths: ['soft', 'balanced', 'intense'] },
    { id: '2', time: '08:00', title: 'Завтрак с триптофаном', description: 'Индейка, бананы, орехи', phase: 'morning', depths: ['balanced', 'intense'] },
    { id: '3', time: '12:00', title: 'Нормальная порция обеда', description: 'Без переедания', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '4', time: '14:00', title: 'Стоп кофеин', description: 'Полувыведение 5-6ч', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '5', time: '18:00', title: 'Лёгкая прогулка', description: 'Снижает кортизол', phase: 'day', depths: ['balanced', 'intense'], easyAlt: '10 мин на воздухе' },
    { id: '6', time: '19:00', title: 'Лёгкий ужин за 3ч', description: 'Вишня, рис, чай', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
    { id: '7', time: '20:00', title: 'Снижение экранов', description: 'Блокирует мелатонин', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
    { id: '8', time: '21:00', title: 'Магний + глицин', description: 'Расслабление', phase: 'evening', depths: ['balanced', 'intense'], newsSignal: 'Магний + глицин расслабляют мышцы за 30 мин' },
    { id: '9', time: '22:00', title: 'Отбой в одно время', description: 'Стабильный ритм', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
  ],
};

const PHASE_CONFIG = {
  morning: { icon: Sun, label: 'Утро', gradient: 'from-amber-400/15 to-orange-300/5', color: 'text-amber-500' },
  day: { icon: CloudSun, label: 'День', gradient: 'from-sky-400/15 to-blue-300/5', color: 'text-sky-500' },
  evening: { icon: Moon, label: 'Вечер', gradient: 'from-indigo-400/15 to-purple-300/5', color: 'text-indigo-400' },
};

export default function Intensive() {
  const { profile } = useProfile();
  const [depth, setDepth] = useState<Depth>('balanced');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expandedPhase, setExpandedPhase] = useState<DayPhase | null>('morning');
  const [showingEasy, setShowingEasy] = useState<Set<string>>(new Set());
  const [recapOpen, setRecapOpen] = useState(false);

  const goal = GOALS.find(g => g.value === profile.goal);
  const allProtocols = PROTOCOLS[profile.goal] || PROTOCOLS.energy;
  const protocols = allProtocols.filter(p => p.depths.includes(depth));

  const toggleComplete = (id: string) => {
    setCompleted(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleEasy = (id: string) => {
    setShowingEasy(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    toast('Заменено на лёгкий вариант 💚');
  };

  const completionRate = protocols.length > 0 ? Math.round((completed.size / protocols.length) * 100) : 0;
  const phases: DayPhase[] = ['morning', 'day', 'evening'];

  // Recap data
  const phaseCompletion = phases.map(phase => {
    const items = protocols.filter(p => p.phase === phase);
    const done = items.filter(p => completed.has(p.id)).length;
    return { phase, total: items.length, done, pct: items.length > 0 ? Math.round((done / items.length) * 100) : 0 };
  });

  return (
    <MobileLayout
      title="Интенсив"
      subtitle={`${goal?.icon} ${goal?.label} · ${DEPTH_LABELS[depth].icon} ${DEPTH_LABELS[depth].label}`}
      variant="warm"
      headerRight={
        <span className="px-2.5 py-1 rounded-lg gradient-deep text-primary-foreground text-[10px] font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> PRO
        </span>
      }
    >
      <div className="pt-3 space-y-3">
        {/* Depth selector — segmented control */}
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
                stroke={completionRate >= 80 ? 'hsl(var(--safe))' : completionRate >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--glow-soft))'}
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
            <p className="text-sm font-bold">{completed.size} из {protocols.length} выполнено</p>
            <p className="text-[10px] text-muted-foreground">{DEPTH_LABELS[depth].desc}</p>
          </div>
          {completed.size > 0 && (
            <button onClick={() => setRecapOpen(true)} className="px-3 py-1.5 rounded-xl glass text-[10px] font-semibold tap-card">
              Итоги
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
                    <p className="text-sm font-bold">{config.label}</p>
                    <p className="text-[10px] text-muted-foreground">{phaseCompleted}/{phaseItems.length} выполнено</p>
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
                          return (
                            <div key={item.id} className="space-y-0.5">
                              <button onClick={() => toggleComplete(item.id)}
                                className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left tap-card transition-opacity ${isDone ? 'opacity-40' : ''}`}>
                                {isDone
                                  ? <CheckCircle2 className="w-5 h-5 text-safe shrink-0" />
                                  : <Circle className="w-5 h-5 text-muted-foreground/30 shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-muted-foreground w-10">{item.time}</span>
                                    <p className={`text-sm font-medium ${isDone ? 'line-through' : ''}`}>
                                      {isEasy && item.easyAlt ? item.easyAlt : item.title}
                                    </p>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 ml-12">{item.description}</p>
                                  {item.easyAlt && !isDone && !isEasy && (
                                    <button onClick={(e) => { e.stopPropagation(); toggleEasy(item.id); }}
                                      className="mt-1 ml-12 flex items-center gap-1 text-[10px] text-primary font-semibold">
                                      <RefreshCw className="w-3 h-3" /> Сделать легче
                                    </button>
                                  )}
                                </div>
                              </button>
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
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1.5">Контроль дня</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {completionRate >= 80 ? '🔥 Отличный день — протокол почти выполнен!'
                : completionRate >= 50 ? '💪 Хороший прогресс. Завершите следующий блок.'
                : '🌱 Начало положено. Каждый шаг приближает к цели.'}
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
              <DrawerTitle className="text-lg font-display font-bold">Итоги дня</DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground mt-1">
                {DEPTH_LABELS[depth].icon} {DEPTH_LABELS[depth].label} · {goal?.label}
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
                      <p className="text-sm font-semibold">{cfg.label}</p>
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
                {completionRate >= 80 ? '🏆 Отличный результат!' : completionRate >= 50 ? '💪 Хороший день!' : '🌱 Завтра будет лучше'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Общий прогресс: {completionRate}%
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </MobileLayout>
  );
}
