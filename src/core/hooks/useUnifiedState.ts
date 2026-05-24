import { useAppStore } from '../store/appStore';
import { selectSnapshot } from '../store/selectors';

export function useUnifiedState() {
  const snapshot = useAppStore(selectSnapshot);
  const profile  = useAppStore(s => s.profile);
  const goals    = useAppStore(s => s.goals);
  return { snapshot, profile, goals };
}
