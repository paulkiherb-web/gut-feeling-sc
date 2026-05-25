import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Crown } from 'lucide-react';
import OrganicBackground from '@/components/OrganicBackground';
import { FREE_LIMITS, PREMIUM_LIMITS } from '@/core/boosta/premium';

interface Row { label: string; free: string; premium: string }

const ROWS: Row[] = [
  { label: 'AI-сканы в день',          free: String(FREE_LIMITS.aiScansPerDay), premium: '∞' },
  { label: 'События чек-ина в день',   free: String(FREE_LIMITS.eventsPerDay),  premium: '∞' },
  { label: 'История',                  free: `${FREE_LIMITS.historyDays} дн.`,  premium: 'без ограничений' },
  { label: 'Связи (married/parole)',   free: String(FREE_LIMITS.maxBonds),       premium: String(PREMIUM_LIMITS.maxBonds) },
  { label: 'Создание команд',          free: '—',                                premium: 'есть' },
  { label: 'Истории в HD',             free: '—',                                premium: 'есть' },
  { label: 'AI-анализ паттернов',      free: '—',                                premium: 'есть' },
];

export default function Paywall() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');

  const back = () => navigate('/boosta');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <OrganicBackground variant="warm" intensity="medium" />
      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            className="w-20 h-20 rounded-3xl gradient-organic flex items-center justify-center mx-auto mb-6 shadow-lg"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Crown className="w-9 h-9 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Boosta Premium
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Безлимит, расширенная история, до 5 связей, команды.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-glow rounded-3xl p-5 mb-6"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left font-medium pb-2">Возможность</th>
                <th className="text-right font-medium pb-2 pr-3">Free</th>
                <th className="text-right font-medium pb-2">Premium</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-t border-border/40">
                  <td className="py-2.5">{r.label}</td>
                  <td className="py-2.5 text-right text-muted-foreground pr-3">{r.free}</td>
                  <td className="py-2.5 text-right font-medium text-primary">
                    {r.premium === 'есть' ? <Check className="w-4 h-4 inline" /> : r.premium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setPlan('monthly')}
            className={`p-4 rounded-2xl text-center transition-all ${
              plan === 'monthly' ? 'glass-glow border-primary/50 shadow-lg' : 'glass'
            }`}
          >
            <p className="text-xl font-display font-bold">$9.99</p>
            <p className="text-xs text-muted-foreground">/мес</p>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setPlan('yearly')}
            className={`p-4 rounded-2xl text-center transition-all relative ${
              plan === 'yearly' ? 'glass-glow border-primary/50 shadow-lg' : 'glass'
            }`}
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold gradient-organic text-primary-foreground px-3 py-0.5 rounded-full shadow-sm">
              ВЫГОДНО
            </span>
            <p className="text-xl font-display font-bold">$59.99</p>
            <p className="text-xs text-muted-foreground">/год</p>
          </motion.button>
        </motion.div>

        <div className="mt-auto space-y-3">
          <Button
            onClick={back}
            className="w-full rounded-2xl h-14 text-base font-semibold gradient-organic border-0 shadow-lg glow-primary"
          >
            Активировать ({plan === 'yearly' ? '$59.99/год' : '$9.99/мес'})
          </Button>
          <button
            onClick={back}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Продолжить с бесплатным планом
          </button>
        </div>
      </div>
    </div>
  );
}
