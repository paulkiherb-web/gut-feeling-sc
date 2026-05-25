import { Info } from 'lucide-react';
import CorridorSignal from './CorridorSignal';

interface MirrorBlockProps {
  hasHistory: boolean;
}

// Mock data for the visual layer only. We will connect real signals later.
const MOCK_INSIGHT = 'Утро пока держится в коридоре.';
const MOCK_SCORE = 3;
const MOCK_NOTE = 'В прошлые вторники фокус падал к 15:00. Сегодня пока лучше.';

export default function MirrorBlock({ hasHistory }: MirrorBlockProps) {
  return (
    <div className="rounded-3xl glass-premium p-5 min-h-[32dvh] flex flex-col justify-between space-y-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
        {hasHistory ? 'Твоё зеркало — сейчас' : 'Твоё зеркало'}
      </p>

      {!hasHistory ? (
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full border border-border/40 flex items-center justify-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-muted/30 border border-border/30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
            </div>
          </div>
          <div>
            <p className="text-[15px] font-display font-bold leading-tight">Пока пусто.</p>
            <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
              Первый скан покажет,
              <br />
              где ты сейчас.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[16px] font-display font-bold leading-snug">
            {MOCK_INSIGHT}
          </p>

          <CorridorSignal score={MOCK_SCORE} />

          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.8} />
            <p className="text-[12px] text-muted-foreground leading-snug">
              {MOCK_NOTE}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
