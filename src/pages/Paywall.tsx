import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Shield, FlaskConical, Crown } from 'lucide-react';

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
      {/* Blurred food background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-safe/30 via-warning/20 to-danger/30 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-16 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl gradient-safe flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-safe-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Unlock Your Digital
            <br />Nutritionist
          </h1>
          <p className="text-muted-foreground mt-3">
            Personalized food analysis powered by AI
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6 mb-8 space-y-4"
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">{f.text}</span>
              <Check className="w-5 h-5 text-primary ml-auto" />
            </div>
          ))}
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          <button
            onClick={() => setPlan('monthly')}
            className={`p-5 rounded-2xl border text-center transition-all ${
              plan === 'monthly'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <p className="text-2xl font-bold">$9.99</p>
            <p className="text-sm text-muted-foreground">/month</p>
          </button>
          <button
            onClick={() => setPlan('yearly')}
            className={`p-5 rounded-2xl border text-center transition-all relative ${
              plan === 'yearly'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-primary text-primary-foreground px-3 py-0.5 rounded-full">
              BEST VALUE
            </span>
            <p className="text-2xl font-bold">$59.99</p>
            <p className="text-sm text-muted-foreground">/year</p>
          </button>
        </motion.div>

        {/* CTA */}
        <div className="mt-auto space-y-3">
          <Button onClick={start} className="w-full rounded-2xl h-14 text-base font-semibold">
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
