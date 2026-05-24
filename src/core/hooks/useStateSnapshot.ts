import { useAppStore } from '../store/appStore';
import { selectStateSnapshot } from '../store/selectors';

export const useStateSnapshot = () => {
  const snapshot = useAppStore(selectStateSnapshot);
  const isHydrated = useAppStore((state) => state.isHydrated);

  return { snapshot, isHydrated };
};
