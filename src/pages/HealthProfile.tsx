import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { CONDITIONS, GOALS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import OrganicBackground from '@/components/OrganicBackground';

export default function HealthProfile() {
  const { profile, resetOnboarding } = useProfile();
  const navigate = useNavigate();
  const condition = CONDITIONS.find(c => c.value === profile.condition);
  const goal = GOALS.find(g => g.value === profile.goal);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden px-6 pt-14 pb-8">
      <OrganicBackground variant="cool" intensity="subtle" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/scanner')}
            className="w-11 h-11 rounded-full glass flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-lg font-display font-bold">Health Profile</h1>
          <div className="w-11" />
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-glow rounded-3xl p-6 mb-5"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-organic flex items-center justify-center text-2xl shadow-lg">
              {profile.gender === 'male' ? '♂' : profile.gender === 'female' ? '♀' : '⚧'}
            </div>
            <div>
              <p className="text-3xl font-display font-bold">{profile.age} years old</p>
              <p className="text-sm text-muted-foreground capitalize">{profile.gender}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Condition</p>
              <p className="text-lg">{condition?.icon} {condition?.label}</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Goal</p>
              <p className="text-lg">{goal?.icon} {goal?.label}</p>
            </div>
          </div>

          {profile.condition === 'post_surgery' && profile.surgeryDays && (
            <div className="glass rounded-2xl p-4 mt-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Recovery</p>
              <p className="text-lg">🏥 Day {profile.surgeryDays} post-surgery</p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-glow rounded-3xl p-6 mb-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">Today's Usage</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scan className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold">{profile.dailyScansUsed}/3</p>
              <p className="text-sm text-muted-foreground">
                {profile.isPremium ? 'Unlimited scans' : 'Free scans used'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => { resetOnboarding(); navigate('/'); }}
            className="w-full rounded-2xl h-14 glass border-border/40"
          >
            <Settings className="w-5 h-5 mr-2" /> Redo Onboarding
          </Button>
          <Button
            onClick={() => navigate('/scanner')}
            className="w-full rounded-2xl h-14 text-base font-semibold gradient-organic border-0 shadow-lg glow-primary"
          >
            <Scan className="w-5 h-5 mr-2" /> Back to Scanner
          </Button>
        </div>
      </div>
    </div>
  );
}
