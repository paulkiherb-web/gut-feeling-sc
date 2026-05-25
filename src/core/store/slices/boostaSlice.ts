import { create } from 'zustand';

export type Course =
  | 'focus' | 'energy' | 'sleep' | 'calm'
  | 'weight_loss' | 'muscle_gain' | 'recovery'
  | string;

export type EventCategory = 'food' | 'movement' | 'substance' | 'rest' | 'stimulation';

export interface BoostaEvent {
  id: string;
  category: EventCategory;
  name: string;
  timestamp: number;
  impactReal: number;
  impactGhost: number;
  verdict: 'aligned' | 'drift' | 'neutral';
  note?: string;
}

export interface BoostaState {
  todayCourse: Course;
  customCourse?: string;
  events: BoostaEvent[];
  realCharge: number;
  ghostCharge: number;
  lastWhisper?: string;
  whisperShownAt?: number;

  setCourse: (c: Course, custom?: string) => void;
  addEvent: (e: Omit<BoostaEvent, 'id' | 'timestamp'>) => void;
  removeEvent: (id: string) => void;
  recomputeCharges: () => void;
  setWhisper: (text: string) => void;
  clearWhisper: () => void;
}

export const useBoostaStore = create<BoostaState>((set, get) => ({
  todayCourse: 'focus',
  events: [],
  realCharge: 80,
  ghostCharge: 80,

  setCourse: (c, custom) => {
    set({ todayCourse: c, customCourse: custom });
    get().recomputeCharges();
  },

  addEvent: (e) => {
    const event: BoostaEvent = {
      ...e,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    set((s) => ({ events: [...s.events, event] }));
    get().recomputeCharges();
  },

  removeEvent: (id) => {
    set((s) => ({ events: s.events.filter((x) => x.id !== id) }));
    get().recomputeCharges();
  },

  recomputeCharges: () => {
    const { events } = get();
    const startReal = 80;
    const startGhost = 80;
    const realDelta = events.reduce((acc, e) => acc + e.impactReal, 0);
    const ghostDelta = events.reduce((acc, e) => acc + e.impactGhost, 0);
    set({
      realCharge: Math.max(0, Math.min(100, startReal + realDelta)),
      ghostCharge: Math.max(0, Math.min(100, startGhost + ghostDelta)),
    });
  },

  setWhisper: (text) => set({ lastWhisper: text, whisperShownAt: Date.now() }),
  clearWhisper: () => set({ lastWhisper: undefined }),
}));
