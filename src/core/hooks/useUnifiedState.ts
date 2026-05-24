import { useAppStore } from '../store/appStore';
import { useStateSnapshot } from './useStateSnapshot';

export function useUnifiedState() {
  const { snapshot } = useStateSnapshot();
  const profile = useAppStore((state) => state.profile);
  const goals = useAppStore((state) => state.goals);
  return { snapshot, profile, goals };
}
