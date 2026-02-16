import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { GOALS, DIETS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import OrganicBackground from '@/components/OrganicBackground';

export default function HealthProfile() {
  const { profile, resetOnboarding } = useProfile();
  const navigate = useNavigate();
  const goal = GOALS.find(g => g.value === profile.goal);
  const h = profile.heightCm || 170;
  const w = profile.weightKg || 70;
  const bmi = w / ((h / 100) ** 2);
  const activeDiets = (profile.diets || []).filter(d => d !== 'none');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden px-6 pt-14 pb-8">
      <OrganicBackground variant="cool" intensity="subtle" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/scanner')} className="w-11 h-11 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-lg font-display font-bold">Health Profile</h1>
          <div className="w-11" />
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-glow rounded-3xl p-6 mb-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-organic flex items-center justify-center text-2xl shadow-lg">
              {profile.gender === 'male' ? '♂' : profile.gender === 'female' ? '♀' : '⚧'}
            </div>
            <div>
              <p className="text-3xl font-display font-bold">{profile.age} years</p>
              <p className="text-sm text-muted-foreground capitalize">{profile.gender} {profile.location ? `• ${profile.location}` : ''}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">BMI</p>
              <p className="text-xl font-display font-bold text-primary">{bmi.toFixed(1)}</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Height</p>
              <p className="text-xl font-display font-bold">{h}cm</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Weight</p>
              <p className="text-xl font-display font-bold">{w}kg</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-glow rounded-3xl p-6 mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">Goal</p>
          <p className="text-lg font-medium">{goal?.icon} {goal?.label}</p>
          {activeDiets.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3 mt-5">Diets</p>
              <div className="flex flex-wrap gap-2">
                {activeDiets.map(d => {
                  const diet = DIETS.find(dd => dd.value === d);
                  return (
                    <span key={d} className="px-3 py-1.5 rounded-full glass text-xs font-medium">
                      {diet?.icon} {diet?.label}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>

        <div className="space-y-3">
          <Button variant="outline" onClick={() => { resetOnboarding(); navigate('/'); }} className="w-full rounded-2xl h-14 glass border-border/40">
            <Settings className="w-5 h-5 mr-2" /> Redo Onboarding
          </Button>
          <Button onClick={() => navigate('/scanner')} className="w-full rounded-2xl h-14 text-base font-semibold gradient-organic border-0 shadow-lg glow-primary">
            <Scan className="w-5 h-5 mr-2" /> Back to Scanner
          </Button>
        </div>
      </div>
    </div>
  );
}
