import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { GOALS } from '@/types/profile';
import { Sun, CloudSun, Moon, CheckCircle2, Circle, Sparkles, Zap, ChevronDown, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

type Depth = 'soft' | 'balanced' | 'intense';
type DayPhase = 'morning' | 'day' | 'evening';

const DEPTH_LABELS: Record<Depth, { label: string; description: string }> = {
  soft: { label: 'Мягкий', description: 'Лёгкие привычки без давления' },
  balanced: { label: 'Собранный', description: 'Оптимальный баланс дисциплины' },
  intense: { label: 'Высокий фокус', description: 'Максимальная дисциплина и контроль' },
};

interface ProtocolItem {
  id: string;
  time: string;
  title: string;
  description: string;
  phase: DayPhase;
  depths: Depth[];
  easyAlt?: string; // "make it easier" alternative
  newsSignal?: string; // contextual news inside the step
}

const PROTOCOLS: Record<string, ProtocolItem[]> = {
  energy: [
    { id: '1', time: '06:30', title: 'Стакан воды + лимон', description: 'Запускает метаболизм и гидратирует после ночи', phase: 'morning', depths: ['soft', 'balanced', 'intense'], easyAlt: 'Просто стакан тёплой воды — тоже работает' },
    { id: '2', time: '07:00', title: '10 мин дыхание / прогулка', description: 'Свет утром синхронизирует циркадный ритм', phase: 'morning', depths: ['balanced', 'intense'], easyAlt: '5 мин у окна с открытой шторой', newsSignal: 'Утренний свет в первые 30 мин повышает энергию на весь день на 40%' },
    { id: '3', time: '07:30', title: 'Завтрак: белок + сложные углеводы', description: 'Яйца, овсянка, авокадо — стабильная энергия', phase: 'morning', depths: ['soft', 'balanced', 'intense'] },
    { id: '4', time: '08:00', title: 'Утренний стек: Omega-3 + D3', description: 'Базовые добавки для нервной системы', phase: 'morning', depths: ['balanced', 'intense'], newsSignal: 'D3 усваивается с жирами — принимайте вместе с завтраком' },
    { id: '5', time: '10:00', title: 'Фокус-блок: 90 мин работы', description: 'Пик кортизола — используйте для сложных задач', phase: 'day', depths: ['balanced', 'intense'], easyAlt: 'Хотя бы 45 мин без отвлечений' },
    { id: '6', time: '12:00', title: 'Обед: основной приём', description: 'Максимальная калорийность дня здесь', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '7', time: '14:00', title: 'Последний кофеин', description: 'После 14:00 кофеин мешает вечернему сну', phase: 'day', depths: ['soft', 'balanced', 'intense'], newsSignal: 'Период полувыведения кофеина — 5-6 часов. Кофе в 16:00 = 50% кофеина к 22:00' },
    { id: '8', time: '16:00', title: 'Движение: 15–30 мин', description: 'Прогулка или лёгкая тренировка для второго окна энергии', phase: 'day', depths: ['balanced', 'intense'], easyAlt: '10 мин прогулка вокруг дома' },
    { id: '9', time: '19:00', title: 'Лёгкий ужин', description: 'Белок + овощи, без тяжёлых углеводов', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
    { id: '10', time: '20:30', title: 'Магний + снижение экранов', description: 'Магний глицинат расслабляет мышцы', phase: 'evening', depths: ['balanced', 'intense'], easyAlt: 'Хотя бы снизить яркость и убрать ленту', newsSignal: 'Синий свет экранов подавляет мелатонин на 50% — f.lux или Night Shift' },
    { id: '11', time: '22:00', title: 'Отбой', description: 'Стабильное время сна — основа энергии', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
  ],
  weight_loss: [
    { id: '1', time: '07:00', title: 'Вода натощак 500мл', description: 'Метаболизм +24% на 90 минут', phase: 'morning', depths: ['soft', 'balanced', 'intense'], newsSignal: 'Холодная вода заставляет тело тратить калории на нагрев — бонус 50 ккал/день' },
    { id: '2', time: '07:30', title: 'HIIT / прогулка 20 мин', description: 'Жиросжигание натощак', phase: 'morning', depths: ['balanced', 'intense'], easyAlt: '10 мин быстрая ходьба' },
    { id: '3', time: '08:00', title: 'Высокобелковый завтрак', description: '30г белка: яйца, творог, протеин', phase: 'morning', depths: ['soft', 'balanced', 'intense'] },
    { id: '4', time: '12:00', title: 'Обед: белок + овощи', description: 'Клетчатка замедляет всасывание', phase: 'day', depths: ['soft', 'balanced', 'intense'], newsSignal: 'Клетчатка из овощей снижает гликемический индекс всего приёма на 30%' },
    { id: '5', time: '15:00', title: 'Перекус: орехи + яблоко', description: 'Не допускайте голода > 5ч', phase: 'day', depths: ['balanced', 'intense'], easyAlt: 'Горсть миндаля (15 штук)' },
    { id: '6', time: '18:00', title: 'Тренировка / прогулка', description: '10000 шагов — фундамент расхода', phase: 'day', depths: ['soft', 'balanced', 'intense'], easyAlt: '5000 шагов — уже отличный результат' },
    { id: '7', time: '19:00', title: 'Лёгкий ужин за 3ч до сна', description: 'Рыба/курица + зелень', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
    { id: '8', time: '22:00', title: 'Сон 7-8 часов', description: 'Недосып повышает грелин и аппетит', phase: 'evening', depths: ['balanced', 'intense'], newsSignal: 'Недосып увеличивает потребление на 300-400 ккал в день' },
  ],
  recovery: [
    { id: '1', time: '07:30', title: 'Вода + коллаген', description: 'Коллаген ускоряет восстановление тканей', phase: 'morning', depths: ['soft', 'balanced', 'intense'], newsSignal: 'Коллаген с витамином C усваивается на 60% эффективнее' },
    { id: '2', time: '08:00', title: 'Завтрак: белок 35г+', description: 'Увеличенная порция для регенерации', phase: 'morning', depths: ['soft', 'balanced', 'intense'] },
    { id: '3', time: '10:00', title: 'Лёгкая мобильность', description: 'Растяжка без нагрузки — кровоток', phase: 'morning', depths: ['balanced', 'intense'], easyAlt: '5 мин лёгкой разминки в кресле' },
    { id: '4', time: '12:00', title: 'Обед: жирная рыба + овощи', description: 'Omega-3 снижает воспаление', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '5', time: '15:00', title: 'Витамин C + Цинк', description: 'Иммунитет и заживление', phase: 'day', depths: ['balanced', 'intense'], newsSignal: 'Цинк ускоряет заживление ран на 40% — не пропускайте' },
    { id: '6', time: '19:00', title: 'Лёгкий ужин + магний', description: 'Восстановление во сне', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
    { id: '7', time: '21:30', title: 'Отбой рано', description: '8-9 часов сна — главный протокол', phase: 'evening', depths: ['balanced', 'intense'], newsSignal: 'Глубокий сон в первые 3 часа отвечает за 80% восстановления' },
  ],
  sleep: [
    { id: '1', time: '07:00', title: 'Свет в первые 30 мин', description: 'Яркий свет утром настраивает мелатонин на вечер', phase: 'morning', depths: ['soft', 'balanced', 'intense'], newsSignal: '10000 люкс утром = на 50% больше мелатонина вечером' },
    { id: '2', time: '08:00', title: 'Завтрак с триптофаном', description: 'Индейка, бананы, орехи — предшественники сна', phase: 'morning', depths: ['balanced', 'intense'] },
    { id: '3', time: '12:00', title: 'Обед: нормальная порция', description: 'Не переедайте — тяжесть мешает ритму', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '4', time: '14:00', title: 'Стоп кофеин', description: 'Период полувыведения 5-6ч', phase: 'day', depths: ['soft', 'balanced', 'intense'] },
    { id: '5', time: '18:00', title: 'Лёгкая прогулка', description: 'Снижает кортизол перед вечером', phase: 'day', depths: ['balanced', 'intense'], easyAlt: '10 мин в парке или дворе' },
    { id: '6', time: '19:00', title: 'Ужин: лёгкий, за 3ч до сна', description: 'Вишня, рис, травяной чай', phase: 'evening', depths: ['soft', 'balanced', 'intense'] },
    { id: '7', time: '20:00', title: 'Снижение экранов + f.lux', description: 'Синий свет блокирует мелатонин', phase: 'evening', depths: ['soft', 'balanced', 'intense'], newsSignal: 'Тёплый свет 1800K после 20:00 — золотой стандарт гигиены сна' },
    { id: '8', time: '21:00', title: 'Магний + глицин', description: 'Расслабляет нервную систему', phase: 'evening', depths: ['balanced', 'intense'] },
    { id: '9', time: '22:00', title: 'Отбой в одно время', description: 'Стабильный ритм = глубокий сон', phase: 'evening', depths: ['soft', 'balanced', 'intense'], newsSignal: 'Температура комнаты 18-19°C — доказанный способ улучшить сон' },
  ],
};

const PHASE_CONFIG = {
  morning: { icon: Sun, label: 'Утро', gradient: 'from-amber-400/20 to-orange-300/10', signal: '☀️' },
  day: { icon: CloudSun, label: 'День', gradient: 'from-sky-400/20 to-blue-300/10', signal: '⚡' },
  evening: { icon: Moon, label: 'Вечер', gradient: 'from-indigo-400/20 to-purple-300/10', signal: '🌙' },
};

export default function Intensive() {
  const { profile } = useProfile();
  const [depth, setDepth] = useState<Depth>('balanced');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expandedPhase, setExpandedPhase] = useState<DayPhase | null>('morning');
  const [showingEasy, setShowingEasy] = useState<Set<string>>(new Set());

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

  // Phase-level news signals
  const getPhaseSignals = (phase: DayPhase) =>
    protocols.filter(p => p.phase === phase && p.newsSignal).map(p => p.newsSignal!);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <OrganicBackground variant="warm" intensity="subtle" />
      <div className="relative z-10 px-5 pt-14">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-display font-extrabold tracking-tight">Интенсив</h1>
          <span className="px-3 py-1 rounded-xl gradient-premium text-primary-foreground text-[10px] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> PRO
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Персональный протокол · {goal?.icon} {goal?.label}</p>

        {/* Depth Selector */}
        <div className="flex gap-2 mb-5">
          {(Object.keys(DEPTH_LABELS) as Depth[]).map(d => (
            <button key={d} onClick={() => setDepth(d)}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                depth === d ? 'gradient-organic text-primary-foreground shadow-sm' : 'glass text-muted-foreground'
              }`}>
              {DEPTH_LABELS[d].label}
            </button>
          ))}
        </div>

        {/* Completion Progress */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="glass-glow rounded-2xl p-4 mb-5 flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - completionRate / 100)}
                className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-display font-bold">{completionRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Выполнение протокола</p>
            <p className="text-[10px] text-muted-foreground">{completed.size} из {protocols.length} шагов · {DEPTH_LABELS[depth].description}</p>
          </div>
        </motion.div>

        {/* Protocol Timeline */}
        <div className="space-y-3 mb-5">
          {phases.map(phase => {
            const phaseItems = protocols.filter(p => p.phase === phase);
            if (phaseItems.length === 0) return null;
            const config = PHASE_CONFIG[phase];
            const PhaseIcon = config.icon;
            const isExpanded = expandedPhase === phase;
            const phaseCompleted = phaseItems.filter(p => completed.has(p.id)).length;
            const phaseSignals = getPhaseSignals(phase);

            return (
              <motion.div key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => setExpandedPhase(isExpanded ? null : phase)}
                  className={`w-full glass-strong rounded-2xl p-4 flex items-center gap-3 transition-all ${isExpanded ? 'rounded-b-none' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                    <PhaseIcon className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{config.label}</p>
                    <p className="text-[10px] text-muted-foreground">{phaseCompleted}/{phaseItems.length} выполнено</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden glass rounded-2xl rounded-t-none border-t-0">
                      <div className="p-3 space-y-1">
                        {phaseItems.map(item => {
                          const isDone = completed.has(item.id);
                          const isEasy = showingEasy.has(item.id);
                          return (
                            <div key={item.id} className="space-y-1">
                              <button onClick={() => toggleComplete(item.id)}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${isDone ? 'opacity-50' : ''}`}>
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-safe shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-muted-foreground">{item.time}</span>
                                    <p className={`text-sm font-medium ${isDone ? 'line-through' : ''}`}>
                                      {isEasy && item.easyAlt ? item.easyAlt : item.title}
                                    </p>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>

                                  {/* Easy alternative button */}
                                  {item.easyAlt && !isDone && !isEasy && (
                                    <button onClick={(e) => { e.stopPropagation(); toggleEasy(item.id); }}
                                      className="mt-1.5 flex items-center gap-1 text-[10px] text-primary font-medium">
                                      <RefreshCw className="w-3 h-3" /> Сделать легче
                                    </button>
                                  )}
                                </div>
                              </button>

                              {/* News signal inside the step (§11) */}
                              {item.newsSignal && !isDone && (
                                <div className="ml-8 mr-2 mb-1 flex items-start gap-1.5 px-3 py-2 rounded-lg bg-accent/5">
                                  <Zap className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-muted-foreground leading-relaxed">{item.newsSignal}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Phase summary signal */}
                      {phaseSignals.length > 0 && (
                        <div className="px-3 pb-3">
                          <div className="glass rounded-xl p-3 flex items-start gap-2">
                            <span className="text-sm">{config.signal}</span>
                            <div>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Сигнал протокола</p>
                              <p className="text-[11px] text-muted-foreground">{phaseSignals[0]}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Daily control — recap */}
        {completed.size > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-glow rounded-2xl p-4 mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Контроль дня</p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {completionRate >= 80 ? '🔥 Отличный день — протокол почти выполнен. Продолжайте!'
                : completionRate >= 50 ? '💪 Хороший прогресс. Завершите вечерний блок для максимального эффекта.'
                : '🌱 Начало положено. Каждый выполненный шаг приближает к цели.'}
            </p>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
