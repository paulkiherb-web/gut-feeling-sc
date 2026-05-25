export function mapVerdictToImpact(
  verdict: string,
  kind: 'real' | 'ghost',
): number {
  const v = verdict.toLowerCase();
  if (v === 'green') return kind === 'real' ? 8 : 10;
  if (v === 'red')   return kind === 'real' ? -10 : -6;
  // yellow / neutral
  return kind === 'real' ? 2 : 1;
}
