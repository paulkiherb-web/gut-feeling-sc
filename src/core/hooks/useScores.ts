import { useAppStore } from '../store/appStore';
import { EMPTY_SCORECARD } from '../store/slices';

export function useScores() {
  return useAppStore((state) => state.scores) ?? EMPTY_SCORECARD;
}
