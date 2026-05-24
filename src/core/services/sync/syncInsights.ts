import type { Insight } from '../../store/types/state';

export async function syncInsights(insights: Insight[]): Promise<void> {
  try { localStorage.setItem('core_insights_v1', JSON.stringify(insights)); } catch {}
}
