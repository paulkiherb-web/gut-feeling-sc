import { useState, useEffect } from 'react';
import type { UserProfile, Condition, Gender, Goal } from '@/types/profile';

const STORAGE_KEY = 'greenred_profile';
const ONBOARDED_KEY = 'greenred_onboarded';

const defaultProfile: UserProfile = {
  age: 25,
  gender: 'male',
  condition: 'healthy',
  goal: 'energy',
  isPremium: false,
  dailyScansUsed: 0,
};

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [onboarded, setOnboardedState] = useState(() => {
    return localStorage.getItem(ONBOARDED_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfileState(prev => ({ ...prev, ...updates }));
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
