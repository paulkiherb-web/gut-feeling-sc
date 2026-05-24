export interface LongitudinalMemory {
  firstEventAt: string | null;
  lastEventAt: string | null;
  totalEventCount: number;
  activeDays: number;
  spanDays: number;
}

export const EMPTY_LONGITUDINAL_MEMORY: LongitudinalMemory = {
  firstEventAt: null,
  lastEventAt: null,
  totalEventCount: 0,
  activeDays: 0,
  spanDays: 0,
};
