import { useAppStore } from '../store/appStore';
import { selectPredictions } from '../store/selectors';

export const usePredictions = () => {
  const predictions = useAppStore(selectPredictions);

  return {
    predictions,
    topPrediction: predictions[0] ?? null,
  };
};
