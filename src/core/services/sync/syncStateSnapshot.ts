import type { StateSnapshot } from '../../store/types/state';
import { saveJson } from './storage';

export async function syncStateSnapshot(snapshot: StateSnapshot): Promise<void> {
  saveJson('state-os-snapshot-v1', snapshot);
}
