import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dualUpdate } from '@/core/boosta/dualWrite';
import { normalizeGoal, type UserProfile } from '@/types/profile';

export const PROFILE_STORAGE_KEY = 'greenred_profile';
export const PROFILE_ONBOARDED_KEY = 'greenred_onboarded';

const STORAGE_KEY = PROFILE_STORAGE_KEY;
const ONBOARDED_KEY = PROFILE_ONBOARDED_KEY;

const defaultProfile: UserProfile = {
  age: 25,
  gender: 'male',
  condition: 'healthy',
  goal: 'energy',
  isPremium: true, // unlimited for now
  dailyScansUsed: 0,
  diets: [],
};

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultProfile,
        ...parsed,
        goal: normalizeGoal(parsed.goal),
        diets: Array.isArray(parsed.diets) ? parsed.diets : defaultProfile.diets,
        isPremium: true,
      };
    }
    return defaultProfile;
  });

  const [onboarded, setOnboardedState] = useState(() => {
    return localStorage.getItem(ONBOARDED_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  // Sync profile to DB when it changes
  const syncToDb = useCallback(async (p: UserProfile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await dualUpdate('profiles', {
        age: p.age,
        gender: p.gender,
        condition: p.condition,
        goal: p.goal,
        height_cm: p.heightCm || null,
        weight_kg: p.weightKg || null,
        location: p.location || null,
        diets: p.diets || [],
        display_name: p.displayName || null,
        surgery_days: p.surgeryDays || null,
      }, 'user_id', user.id);
    } catch (e) {
      // silent — localStorage is primary (dayGoal/longGoal/customCondition stay local for now)
    }
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfileState(prev => {
      const next = {
        ...prev,
        ...updates,
        goal: updates.goal ? normalizeGoal(updates.goal) : prev.goal,
        diets: updates.diets ?? prev.diets,
      };
      syncToDb(next);
      return next;
    });
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setOnboardedState(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDED_KEY);
    setOnboardedState(false);
  };

  return { profile, updateProfile, onboarded, completeOnboarding, resetOnboarding };
}
