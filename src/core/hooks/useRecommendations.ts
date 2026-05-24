import { useAppStore } from '../store/appStore';
import { selectRecommendations } from '../store/selectors';

export function useRecommendations() {
  const recommendations = useAppStore(selectRecommendations);
  const nextBestAction = recommendations.find((item) => item.kind === 'next-best') ?? recommendations[0] ?? null;
  const highestLeverageAction = recommendations.find((item) => item.kind === 'highest-leverage') ?? recommendations[0] ?? null;

  return {
    recommendations,
    nextBestAction,
    highestLeverageAction,
    compensationActions: recommendations.filter((item) => item.kind === 'compensation'),
    preventionActions: recommendations.filter((item) => item.kind === 'prevention'),
  };
}
