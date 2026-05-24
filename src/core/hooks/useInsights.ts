import { useAppStore } from '../store/appStore';

export function useInsights() {
  return useAppStore((state) => state.insights.slice(0, 6));
}
