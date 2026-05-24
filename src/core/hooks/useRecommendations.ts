import { useAppStore } from '../store/appStore';
import { selectNextBestAction, selectTodayRecommendations } from '../store/selectors';

export function useRecommendations() {
  const recommendations = useAppStore(selectTodayRecommendations);
  const nextBestAction  = useAppStore(selectNextBestAction);
  return { recommendations, nextBestAction };
}
