import { useAppStore } from '../store/appStore';

export function useScores() {
  return useAppStore(s => s.scores) ?? {
    energy: 0, recovery: 0, sleep: 0, nutrition: 0, readiness: 0, goalAlignment: 0,
  };
}
