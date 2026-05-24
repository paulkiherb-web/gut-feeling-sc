import type { Insight } from '../../store/types/state';
import { saveJson } from './storage';

export async function syncInsights(insights: Insight[]): Promise<void> {
  saveJson('state-os-insights-v1', insights);
}
