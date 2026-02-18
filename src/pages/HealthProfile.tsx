import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { GOALS, DIETS, CONDITIONS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Settings, Crown, Scan, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

export default function Profile() {
  const { profile, resetOnboarding } = useProfile();
  const navigate = useNavigate();
  const goal = GOALS.find(g => g.value === profile.goal);
  const condition = CONDITIONS.find(c => c.value === profile.condition);
  const h = profile.heightCm || 170;
  const w = profile.weightKg || 70;
  const bmi = w / ((h / 100) ** 2);
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const activeDiets = (profile.diets || []).filter(d => d !== 'none');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <OrganicBackground variant="cool" intensity="subtle" />
      <div className="relative z-10 px-5 pt-14">
        <h1 className="text-2xl font-display font-extrabold tracking-tight mb-6">Profile</h1>

        {/* Avatar + Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-glow rounded-3xl p-6 mb-5 flex items-center gap-4"
        >
          <div className="w-18 h-18 w-[4.5rem] h-[4.5rem] rounded-2xl gradient-organic flex items-center justify-center text-3xl shadow-lg">
            {profile.gender === 'male' ? '♂' : profile.gender === 'female' ? '♀' : '⚧'}
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-xl">{profile.displayName || 'User'}</p>
            <p className="text-sm text-muted-foreground capitalize">{profile.gender}, {profile.age} yrs</p>
            {profile.location && <p className="text-xs text-muted-foreground mt-0.5">📍 {profile.location}</p>}
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-strong rounded-3xl p-5 mb-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile.isPremium ? 'gradient-organic' : 'bg-muted'}`}>
                <Crown className={`w-5 h-5 ${profile.isPremium ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{profile.isPremium ? 'Premium' : 'Free Plan'}</p>
                <p className="text-[10px] text-muted-foreground">
                  {profile.isPremium ? 'Unlimited scans' : `${profile.dailyScansUsed}/3 scans today`}
                </p>
              </div>
            </div>
            {!profile.isPremium && (
              <Button
                size="sm"
                onClick={() => navigate('/paywall')}
                className="rounded-xl gradient-organic border-0 text-primary-foreground text-xs"
              >
                Upgrade
              </Button>
            )}
          </div>
        </motion.div>

        {/* Body Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-3xl p-5 mb-5"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">Body</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-2xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-semibold mb-1">BMI</p>
              <p className="text-xl font-display font-bold text-primary">{bmi.toFixed(1)}</p>
              <p className="text-[9px] text-muted-foreground">{bmiLabel}</p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-semibold mb-1">Height</p>
              <p className="text-xl font-display font-bold">{h}</p>
              <p className="text-[9px] text-muted-foreground">cm</p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-semibold mb-1">Weight</p>
              <p className="text-xl font-display font-bold">{w}</p>
              <p className="text-[9px] text-muted-foreground">kg</p>
            </div>
          </div>
        </motion.div>

        {/* Condition + Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-strong rounded-3xl p-5 mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Condition</p>
            <span className="text-sm">{condition?.icon} {condition?.label}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Goal</p>
            <span className="text-sm">{goal?.icon} {goal?.label}</span>
          </div>
          {activeDiets.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">Diets</p>
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

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => { resetOnboarding(); navigate('/'); }}
            className="w-full rounded-2xl h-12 glass border-border/40 justify-between"
          >
            <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Edit Profile</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
