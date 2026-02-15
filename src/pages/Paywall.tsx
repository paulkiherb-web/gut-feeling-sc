import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Shield, FlaskConical, Crown } from 'lucide-react';
import OrganicBackground from '@/components/OrganicBackground';

const features = [
  { icon: Sparkles, text: 'Unlimited AI Scanning' },
  { icon: Shield, text: '24/7 Medical Context' },
  { icon: FlaskConical, text: 'Lab Analysis (Coming Soon)' },
];

export default function Paywall() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const start = () => navigate('/scanner');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <OrganicBackground variant="warm" intensity="medium" />

      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            className="w-20 h-20 rounded-3xl gradient-organic flex items-center justify-center mx-auto mb-6 shadow-lg"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Crown className="w-9 h-9 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold tracking-tight">
            Unlock Your Digital
            <br />Nutritionist
          </h1>
          <p className="text-muted-foreground mt-3 text-base">
            Personalized analysis powered by AI
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-glow rounded-3xl p-6 mb-8 space-y-5"
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-base">{f.text}</span>
              <Check className="w-5 h-5 text-primary ml-auto" />
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setPlan('monthly')}
            className={`p-5 rounded-2xl text-center transition-all ${
              plan === 'monthly'
                ? 'glass-glow border-primary/50 shadow-lg'
                : 'glass hover:border-primary/20'
            }`}
          >
            <p className="text-2xl font-display font-bold">$9.99</p>
            <p className="text-sm text-muted-foreground">/month</p>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setPlan('yearly')}
            className={`p-5 rounded-2xl text-center transition-all relative ${
              plan === 'yearly'
                ? 'glass-glow border-primary/50 shadow-lg'
                : 'glass hover:border-primary/20'
            }`}
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold gradient-organic text-primary-foreground px-3 py-0.5 rounded-full shadow-sm">
              BEST VALUE
            </span>
            <p className="text-2xl font-display font-bold">$59.99</p>
            <p className="text-sm text-muted-foreground">/year</p>
          </motion.button>
        </motion.div>

        <div className="mt-auto space-y-3">
          <Button
            onClick={start}
            className="w-full rounded-2xl h-14 text-base font-semibold gradient-organic border-0 shadow-lg glow-primary"
          >
            Try 7 Days Free
          </Button>
          <button
            onClick={start}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue with 3 free scans/day
          </button>
        </div>
      </div>
    </div>
  );
}
