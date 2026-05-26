import { useEffect } from 'react';
import { installGhostWhisperRouter } from '@/core/boosta/ghostWhisperRouter';

export function useGhostWhisperRouter() {
  useEffect(() => {
    const dispose = installGhostWhisperRouter();
    return dispose;
  }, []);
}
