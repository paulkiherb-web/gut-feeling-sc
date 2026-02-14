import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { CONDITIONS, GOALS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Scan } from 'lucide-react';

export default function HealthProfile() {
  const { profile, resetOnboarding } = useProfile();
  const navigate = useNavigate();

  const condition = CONDITIONS.find(c => c.value === profile.condition);
  const goal = GOALS.find(g => g.value === profile.goal);

  return (
    <div className="min-h-screen bg-background px-6 pt-12 pb-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/scanner')} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Health Profile</h1>
        <div className="w-10" />
      </div>

      {/* Profile Card */}
      <div className="glass rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-safe flex items-center justify-center text-2xl">
            {profile.gender === 'male' ? '♂' : profile.gender === 'female' ? '♀' : '⚧'}
          </div>
          <div>
            <p className="text-2xl font-bold">{profile.age} years old</p>
            <p className="text-sm text-muted-foreground capitalize">{profile.gender}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Condition</p>
            <p className="text-lg">{condition?.icon} {condition?.label}</p>
          </div>
          <div className="bg-secondary/50 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Goal</p>
            <p className="text-lg">{goal?.icon} {goal?.label}</p>
          </div>
        </div>

        {profile.condition === 'post_surgery' && profile.surgeryDays && (
          <div className="bg-secondary/50 rounded-2xl p-4 mt-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recovery</p>
            <p className="text-lg">🏥 Day {profile.surgeryDays} post-surgery</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="glass rounded-3xl p-6 mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Today's Usage</p>
        <div className="flex items-center gap-4">
          <Scan className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{profile.dailyScansUsed}/3</p>
            <p className="text-sm text-muted-foreground">
              {profile.isPremium ? 'Unlimited scans' : 'Free scans used'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => { resetOnboarding(); navigate('/'); }}
          className="w-full rounded-2xl h-14"
        >
          <Settings className="w-5 h-5 mr-2" /> Redo Onboarding
        </Button>
        <Button onClick={() => navigate('/scanner')} className="w-full rounded-2xl h-14 text-base font-semibold">
          <Scan className="w-5 h-5 mr-2" /> Back to Scanner
        </Button>
      </div>
    </div>
  );
}
