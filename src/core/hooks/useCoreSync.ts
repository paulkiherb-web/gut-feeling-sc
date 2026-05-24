import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAppStore } from '../store/appStore';

// Bridges legacy useProfile hook into the unified store so the rest of the app
// can read profile/goals from a single source of truth.
export function useCoreSync() {
  const { profile } = useProfile();
  const setProfile = useAppStore((state) => state.setProfile);
  const setGoals = useAppStore((state) => state.setGoals);

  useEffect(() => {
    setProfile({
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      diets: profile.diets,
      condition: profile.condition,
      customCondition: profile.customCondition,
      displayName: profile.displayName,
      locale: 'ru-RU',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setGoals({
      primaryGoal: profile.goal,
      longGoal: profile.longGoal,
      dayGoal: profile.dayGoal,
      currentFocusState: localStorage.getItem('nutrisee_selected_state') || undefined,
    });
  }, [profile, setProfile, setGoals]);
}
