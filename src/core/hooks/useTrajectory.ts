import { useAppStore } from '../store/appStore';
import { selectTrajectory } from '../store/selectors';

export const useTrajectory = () => useAppStore(selectTrajectory);
