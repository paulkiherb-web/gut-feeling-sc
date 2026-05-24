import type { StateSnapshot } from '../../store/types/state';

// Snapshot is fully derived, so we don't need to persist remotely.
// Local mirror is enough for now (and survives offline).
export async function syncStateSnapshot(snapshot: StateSnapshot): Promise<void> {
  try {
    localStorage.setItem('core_state_snapshot_v1', JSON.stringify(snapshot));
  } catch {}
}
