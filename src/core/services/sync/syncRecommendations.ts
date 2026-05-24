import type { Recommendation } from '../../store/types/state';
import { saveJson } from './storage';

export async function syncRecommendations(recs: Recommendation[]): Promise<void> {
  saveJson('state-os-recommendations-v1', recs);
}
