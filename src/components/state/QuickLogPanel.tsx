import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Pill, CheckSquare, Activity, Droplets } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { capturePipeline } from '@/core/capture';

type LogTab = 'sleep' | 'hydration' | 'supplement' | 'habit' | 'recovery';

interface QuickLogPanelProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: LogTab;
}

const TABS: { key: LogTab; label: string; icon: React.ElementType }[] = [
  { key: 'sleep',      label: 'Сон',     icon: Moon },
  { key: 'hydration',  label: 'Вода',    icon: Droplets },
  { key: 'supplement', label: 'БАД',     icon: Pill },
  { key: 'habit',      label: 'Привычка',icon: CheckSquare },
  { key: 'recovery',   label: 'Восст.',  icon: Activity },
];

const COMMON_SUPPS = ['Магний', 'Витамин D', 'Омега-3', 'Цинк', 'B12', 'Мелатонин', 'Витамин C'];
const COMMON_HABITS = ['Утренняя зарядка', 'Медитация', 'Прогулка', 'Холодный душ', 'Растяжка', 'Чтение'];

export default function QuickLogPanel({ open, onClose, defaultTab = 'sleep' }: QuickLogPanelProps) {
  const [tab, setTab] = useState<LogTab>(defaultTab);

  // Sleep
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState(3);

  // Supplement
  const [suppName, setSuppName] = useState('');
  const [suppDose, setSuppDose] = useState('');

  // Habit
  const [habitName, setHabitName] = useState('');

  // Recovery
  const [stressLevel, setStressLevel] = useState(5);
  const [soreness, setSoreness] = useState(3);

  const logSleep = () => {
    capturePipeline.sleep({ durationHours: sleepHours, quality: sleepQuality / 5 });
    onClose();
  };

  const logHydration = (ml: number) => {
    capturePipeline.hydration({ ml });
    onClose();
  };

  const logSupplement = () => {
    if (!suppName.trim()) return;
    capturePipeline.supplement({ name: suppName.trim(), doseMg: suppDose ? parseInt(suppDose) : undefined });
    setSuppName('');
    setSuppDose('');
    onClose();
  };

  const logHabit = () => {
    if (!habitName.trim()) return;
    capturePipeline.habit({ name: habitName.trim() });
    setHabitName('');
    onClose();
  };

  const logRecovery = () => {
    capturePipeline.recovery({ stressLoad: stressLevel, soreness });
    onClose();
  };

  const inputCls = 'w-full px-4 py-3 rounded-2xl glass border border-border/20 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30';
  const chipCls = (active: boolean) =>
    `px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all active:scale-95 ${active ? 'gradient-organic text-primary-foreground' : 'glass text-muted-foreground'}`;
  const primaryBtn = 'w-full py-3.5 rounded-2xl gradient-organic text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-40';

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="glass-strong border-t border-border/20 px-4 pb-safe-bottom pt-0 rounded-t-3xl max-h-[90dvh] overflow-y-auto no-scrollbar">
        <div className="w-10 h-1 rounded-full bg-muted/60 mx-auto mt-3 mb-4" />
        <DrawerHeader className="px-0 pb-3">
          <DrawerTitle className="text-[13px] font-display font-bold">Записать событие</DrawerTitle>
        </DrawerHeader>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-2xl bg-muted/30 mb-5">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = tab === key;
            return (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-0.5 transition-all ${isActive ? 'gradient-organic text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold leading-none">{label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ── SLEEP ── */}
          {tab === 'sleep' && (
            <motion.div key="sleep" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="space-y-4 pb-4">
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Часов сна: <span className="text-foreground font-bold">{sleepHours}ч</span>
                </p>
                <input type="range" min={3} max={12} step={0.5} value={sleepHours}
                  onChange={e => setSleepHours(parseFloat(e.target.value))}
                  className="w-full accent-primary h-2 cursor-pointer" />
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                  <span>3ч</span><span>7.5ч</span><span>12ч</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">Качество сна</p>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map(q => (
                    <button key={q} onClick={() => setSleepQuality(q)}
                      className={`flex-1 py-2.5 rounded-xl text-lg transition-all active:scale-95 ${sleepQuality === q ? 'gradient-organic shadow-md' : 'glass'}`}>
                      {q === 1 ? '😴' : q === 2 ? '😕' : q === 3 ? '😐' : q === 4 ? '🙂' : '😊'}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={logSleep} className={primaryBtn}>Записать сон</button>
            </motion.div>
          )}

          {/* ── HYDRATION ── */}
          {tab === 'hydration' && (
            <motion.div key="hydration" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="pb-4">
              <p className="text-[11px] text-muted-foreground mb-3">Выберите объём напитка</p>
              <div className="grid grid-cols-3 gap-2">
                {[200, 300, 400, 500, 750, 1000].map(ml => (
                  <button key={ml} onClick={() => logHydration(ml)}
                    className="glass rounded-2xl py-4 flex flex-col items-center gap-1 active:scale-95 transition-all">
                    <span className="text-2xl">💧</span>
                    <span className="text-sm font-bold">{ml}мл</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SUPPLEMENT ── */}
          {tab === 'supplement' && (
            <motion.div key="supplement" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="space-y-3 pb-4">
              <input value={suppName} onChange={e => setSuppName(e.target.value)}
                placeholder="Название БАД / препарата..." className={inputCls} />
              <input value={suppDose} onChange={e => setSuppDose(e.target.value)}
                placeholder="Доза в мг (необязательно)" type="number" className={inputCls} />
              <div>
                <p className="text-[10px] text-muted-foreground mb-2">Быстрый выбор</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SUPPS.map(s => (
                    <button key={s} onClick={() => setSuppName(s)} className={chipCls(suppName === s)}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={logSupplement} disabled={!suppName.trim()} className={primaryBtn}>Записать приём</button>
            </motion.div>
          )}

          {/* ── HABIT ── */}
          {tab === 'habit' && (
            <motion.div key="habit" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="space-y-3 pb-4">
              <input value={habitName} onChange={e => setHabitName(e.target.value)}
                placeholder="Привычка которую выполнили..." className={inputCls} />
              <div>
                <p className="text-[10px] text-muted-foreground mb-2">Быстрый выбор</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_HABITS.map(h => (
                    <button key={h} onClick={() => setHabitName(h)} className={chipCls(habitName === h)}>{h}</button>
                  ))}
                </div>
              </div>
              <button onClick={logHabit} disabled={!habitName.trim()} className={primaryBtn}>Выполнено ✓</button>
            </motion.div>
          )}

          {/* ── RECOVERY ── */}
          {tab === 'recovery' && (
            <motion.div key="recovery" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="space-y-4 pb-4">
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Уровень стресса: <span className="text-foreground font-bold">{stressLevel}/10</span>
                </p>
                <input type="range" min={1} max={10} step={1} value={stressLevel}
                  onChange={e => setStressLevel(parseInt(e.target.value))}
                  className="w-full accent-primary h-2 cursor-pointer" />
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                  <span>минимум</span><span>максимум</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Мышечная боль: <span className="text-foreground font-bold">{soreness}/10</span>
                </p>
                <input type="range" min={1} max={10} step={1} value={soreness}
                  onChange={e => setSoreness(parseInt(e.target.value))}
                  className="w-full accent-primary h-2 cursor-pointer" />
              </div>
              <button onClick={logRecovery} className={primaryBtn}>Записать восстановление</button>
            </motion.div>
          )}
        </AnimatePresence>
      </DrawerContent>
    </Drawer>
  );
}
