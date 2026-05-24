import { useAppStore } from '../store/appStore';
import { useShallow } from 'zustand/react/shallow';

export function useInsights() {
  return useAppStore(useShallow((state) => state.insights.slice(0, 6)));
}
