import type { ConfidenceLevel } from './types';

export type EvidenceClass = 'insufficient' | 'minimal' | 'moderate' | 'substantial' | 'extensive';

export const classifyEvidence = (evidenceCount: number): EvidenceClass => {
  if (evidenceCount < 3) return 'insufficient';
  if (evidenceCount < 6) return 'minimal';
  if (evidenceCount < 10) return 'moderate';
  if (evidenceCount < 20) return 'substantial';
  return 'extensive';
};

export const evidenceToConfidenceFloor = (evidenceClass: EvidenceClass): number => {
  switch (evidenceClass) {
    case 'insufficient': return 0;
    case 'minimal': return 0.15;
    case 'moderate': return 0.35;
    case 'substantial': return 0.55;
    case 'extensive': return 0.70;
  }
};

export const evidenceToConfidenceCeiling = (evidenceClass: EvidenceClass): number => {
  switch (evidenceClass) {
    case 'insufficient': return 0.20;
    case 'minimal': return 0.45;
    case 'moderate': return 0.65;
    case 'substantial': return 0.80;
    case 'extensive': return 0.95;
  }
};

export const evidenceClassToLevel = (evidenceClass: EvidenceClass): ConfidenceLevel => {
  switch (evidenceClass) {
    case 'insufficient': return 'uncertain';
    case 'minimal': return 'emerging';
    case 'moderate': return 'inferred';
    case 'substantial': return 'probable';
    case 'extensive': return 'measured';
  }
};
