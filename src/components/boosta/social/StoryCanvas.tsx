import { forwardRef } from 'react';
import { boostaTokens } from '@/design/boosta/tokens';
import type { StoryType } from '@/core/boosta/stories';

export interface StoryCanvasProps {
  type: StoryType;
  data: {
    real?: number;
    ghost?: number;
    course?: string;
    whisper?: string;
    eventName?: string;
    days?: number;
    teamName?: string;
    milestone?: string;
    handle?: string;
  };
}

const StoryCanvas = forwardRef<HTMLDivElement, StoryCanvasProps>(({ type, data }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: 360,
        height: 640,
        background: `linear-gradient(160deg, ${boostaTokens.color.surface.raised} 0%, ${boostaTokens.color.surface.sunk} 100%)`,
        borderRadius: 32,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        color: boostaTokens.color.surface.ink,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted }}>
        boosta
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {type === 'gap_today' && (
          <>
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginBottom: 8 }}>Разрыв за день · {data.course}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: 24 }}>
              <Battery value={data.real ?? 0} color={boostaTokens.color.real[400]} label="Ты" />
              <Battery value={data.ghost ?? 0} color={boostaTokens.color.ghost[600]} label="Лучший Я" />
            </div>
            <div style={{ marginTop: 24, fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>
              Разрыв: {Math.abs((data.ghost ?? 0) - (data.real ?? 0))}%
            </div>
          </>
        )}

        {type === 'whisper_moment' && (
          <>
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>Лучший Я сказал</p>
            <p style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.25, marginTop: 12, letterSpacing: '-0.01em' }}>
              «{data.whisper ?? '...'}»
            </p>
            {data.eventName && (
              <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted, marginTop: 16 }}>
                на: {data.eventName}
              </p>
            )}
          </>
        )}

        {type === 'breakthrough' && (
          <>
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>Прорыв · {data.days} дней</p>
            <p style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginTop: 12 }}>
              Линии сошлись
            </p>
            <p style={{ fontSize: 18, color: boostaTokens.color.ghost[600], marginTop: 8 }}>
              близость {data.ghost}% / {data.real}%
            </p>
          </>
        )}

        {type === 'course_complete' && (
          <>
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>Курс завершён</p>
            <p style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15, marginTop: 12, letterSpacing: '-0.02em' }}>
              {data.course}
            </p>
            <p style={{ fontSize: 15, color: boostaTokens.color.surface.inkSoft, marginTop: 12 }}>
              {data.days} дней с собой
            </p>
          </>
        )}

        {type === 'team_milestone' && (
          <>
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>Команда</p>
            <p style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginTop: 12 }}>
              {data.teamName}
            </p>
            <p style={{ fontSize: 18, color: boostaTokens.color.ghost[600], marginTop: 12 }}>
              {data.milestone}
            </p>
          </>
        )}
      </div>

      {data.handle && (
        <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>
          @{data.handle}
        </div>
      )}
    </div>
  );
});

StoryCanvas.displayName = 'StoryCanvas';
export default StoryCanvas;

function Battery({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 48, height: 120,
        background: boostaTokens.color.surface.sunk,
        borderRadius: 14, position: 'relative', overflow: 'hidden',
        border: `0.5px solid ${boostaTokens.color.surface.line}`,
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${value}%`, background: color,
        }} />
      </div>
      <span style={{ fontSize: 11, color: boostaTokens.color.surface.inkMuted }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 600 }}>{value}%</span>
    </div>
  );
}
