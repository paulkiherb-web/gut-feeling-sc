import type { Recommendation } from '../../store/types/state';

export async function syncRecommendations(recs: Recommendation[]): Promise<void> {
  try { localStorage.setItem('core_recommendations_v1', JSON.stringify(recs)); } catch {}
}
