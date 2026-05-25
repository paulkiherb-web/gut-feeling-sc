import { JSX, CSSProperties } from 'react';
import { BoostaTokenType, boostaTokenMeta } from './boostaTokenMeta';

export interface BoostaTokenProps {
  type: BoostaTokenType;
  size?: number;
  locked?: boolean;
  showLabel?: boolean;
  showSubLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

const W = 'white';

const TOKEN_ICONS: Record<BoostaTokenType, JSX.Element> = {
  run: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="20" cy="6" r="2.6" />
      <path fill={W} d="M19 10 C16.5 10 14.5 11.5 13.5 13.5 L11 18 L7 18.5 L7.4 21 L12 20.5 C12.8 20.5 13.6 20 14 19.3 L15.2 17.2 L16 20 L13 24 L9 27 L10.6 29 L15.5 25.5 L18.5 22 L19.8 25.5 L23 29.5 L25 28 L22 24.5 L20.6 19.5 L22.5 16.8 L24.5 19 L27 17.5 L23.8 13 C22.7 11.2 20.9 10 19 10 Z" />
    </svg>
  ),
  walk: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="17" cy="5" r="2.5" />
      <path fill={W} d="M16 9 C14.5 9 13.2 9.9 12.7 11.3 L10.5 17 L8 18.2 L8.8 20.2 L12 19 C12.7 18.7 13.3 18.2 13.6 17.5 L14.4 15.5 L15 19 L12.5 24 L10 28 L12 29 L15 25 L17 22 L18.5 26 L20.5 29.5 L22.5 28.5 L20.5 25 L19 19.5 L20.5 17 L22 19 L24.5 18 L21.5 13 C20.7 11.3 19 9 16 9 Z" />
    </svg>
  ),
  swim: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="13" cy="11" r="2.5" />
      <path fill={W} d="M16 14 L21 13 L25 16 L23.5 18 L21 16 L17 17 L14 15 Z" />
      <path fill={W} d="M3 22 C5.5 22 5.5 20 8 20 C10.5 20 10.5 22 13 22 C15.5 22 15.5 20 18 20 C20.5 20 20.5 22 23 22 C25.5 22 25.5 20 28 20 L29 22 C26 22 26 24 23 24 C20 24 20 22 17.5 22 C15 22 15 24 12 24 C9 24 9 22 7 22 C5 22 5 24 3 24 Z" />
      <path fill={W} d="M3 26.5 C5.5 26.5 5.5 24.5 8 24.5 C10.5 24.5 10.5 26.5 13 26.5 C15.5 26.5 15.5 24.5 18 24.5 C20.5 24.5 20.5 26.5 23 26.5 C25.5 26.5 25.5 24.5 28 24.5 L29 26.5 C26 26.5 26 28.5 23 28.5 C20 28.5 20 26.5 17.5 26.5 C15 26.5 15 28.5 12 28.5 C9 28.5 9 26.5 7 26.5 C5 26.5 5 28.5 3 28.5 Z" />
    </svg>
  ),
  bike: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M8 26 a5 5 0 1 1 0.001 0 z M8 22.5 a1.5 1.5 0 1 0 0.001 0 z" />
      <path fill={W} d="M24 26 a5 5 0 1 1 0.001 0 z M24 22.5 a1.5 1.5 0 1 0 0.001 0 z" />
      <path fill={W} d="M10 11 L14 11 L14 13 L12.5 13 L16 19 L20 13 L18 13 L18 11 L23 11 L23 13 L22 13 L25 22 L23 23 L20.5 15.5 L17 21 L15 21 L11.5 15 L9 22 L7 21.5 L10 13 L10 13 Z" />
    </svg>
  ),
  ski: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="19" cy="6" r="2.4" />
      <path fill={W} d="M18 9 C16.5 9 15 9.8 14.3 11.2 L11.5 17 L8 17.5 L8.5 19.5 L13 18.7 C13.7 18.6 14.3 18.1 14.6 17.5 L15.5 15.7 L16 18.5 L13.5 22 L11 25 L13 26 L16 22.5 L18 19.8 L19.5 24 L21.5 27 L23 26 L21.5 23.5 L20 19 L21.8 17 L23.5 18.8 L25.5 17.5 L22 13 C21 11 19.5 9 18 9 Z" />
      <path fill={W} d="M4 27 L28 25 L28 27 L4 29 Z" />
    </svg>
  ),
  morning_charge: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="16" cy="14" r="5" />
      <path fill={W} d="M16 3 L16 7 L14.5 7 L14.5 3 Z M16 21 L16 25 L17.5 25 L17.5 21 Z M3 14 L7 14 L7 15.5 L3 15.5 Z M25 14 L29 14 L29 15.5 L25 15.5 Z M6 5 L9 8 L8 9 L5 6 Z M23 5 L20 8 L21 9 L24 6 Z" />
      <path fill={W} d="M16 18 L11 24 L14 24 L14 30 L18 30 L18 24 L21 24 Z" />
    </svg>
  ),
  cardio: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M16 28 C16 28 4 20 4 12 C4 7.5 7.5 4 12 4 C14 4 15.4 4.9 16 6 C16.6 4.9 18 4 20 4 C24.5 4 28 7.5 28 12 C28 20 16 28 16 28 Z" />
    </svg>
  ),
  hiit: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M18 3 L7 18 L14 18 L11 29 L25 13 L18 13 Z" />
    </svg>
  ),
  strength: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <rect fill={W} x="3" y="13" width="3" height="6" rx="1" />
      <rect fill={W} x="7" y="10" width="3" height="12" rx="1" />
      <rect fill={W} x="22" y="10" width="3" height="12" rx="1" />
      <rect fill={W} x="26" y="13" width="3" height="6" rx="1" />
      <rect fill={W} x="10" y="14.5" width="12" height="3" />
    </svg>
  ),
  yoga: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="16" cy="7" r="2.5" />
      <path fill={W} d="M16 11 C14 11 12.5 12.5 12.5 14.5 L12.5 18 L7 21 C6 21.5 5.5 22.5 6 23.5 C6.5 24.5 7.5 24.8 8.5 24.3 L13 22 L13 24 L4 26 L4.5 28 L14 26.5 C15 26.3 16 26.3 17 26.5 L27.5 28 L28 26 L19 24 L19 22 L23.5 24.3 C24.5 24.8 25.5 24.5 26 23.5 C26.5 22.5 26 21.5 25 21 L19.5 18 L19.5 14.5 C19.5 12.5 18 11 16 11 Z" />
    </svg>
  ),
  stretch: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="16" cy="6" r="2.5" />
      <path fill={W} d="M16 9 C14.5 9 13.5 10 13.5 11.5 L13.5 14 L4 12.5 L3.7 14.7 L13 17 L13 20 L9 28 L11 29 L15 22 L17 22 L21 29 L23 28 L19 20 L19 17 L28.3 14.7 L28 12.5 L18.5 14 L18.5 11.5 C18.5 10 17.5 9 16 9 Z" />
    </svg>
  ),
  water: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M16 2 C16 2 6 14 6 20 C6 26 10.5 30 16 30 C21.5 30 26 26 26 20 C26 14 16 2 16 2 Z" />
    </svg>
  ),
  coffee: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M10 3 C10 3 9 5 10 6.5 C11 8 11 9 10 10 L12 10 C13 9 13 8 12 6.5 C11 5 12 3 12 3 Z M15 3 C15 3 14 5 15 6.5 C16 8 16 9 15 10 L17 10 C18 9 18 8 17 6.5 C16 5 17 3 17 3 Z" />
      <path fill={W} d="M5 13 L5 22 C5 25 7 27 10 27 L19 27 C22 27 24 25 24 22 L24 21 C26.5 21 28 19.5 28 17 C28 14.5 26.5 13 24 13 Z M24 15 L24 19 C25.5 19 26 18 26 17 C26 16 25.5 15 24 15 Z" />
    </svg>
  ),
  alcohol: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M8 4 L24 4 L22 14 C21.5 16.5 19.5 18 17 18 L17 25 L21 25 L21 27 L11 27 L11 25 L15 25 L15 18 C12.5 18 10.5 16.5 10 14 Z" />
    </svg>
  ),
  smoking: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M22 4 C22 6 23 7 24 8 C25 9 25 11 24 12 L26 12 C27 11 27 9 26 7.5 C25 6 26 4 26 4 Z" />
      <rect fill={W} x="3" y="20" width="20" height="4" rx="1" />
      <rect fill={W} x="24" y="20" width="3" height="4" rx="1" />
      <path fill={W} d="M5 15 C5 17 6 18 6 19 L8 19 C8 17 7 16 7 15 Z M11 13 C11 15 12 16 12 17 L14 17 C14 15 13 14 13 13 Z" />
    </svg>
  ),
  medicine: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M6 10 L16 20 C18.5 22.5 22.5 22.5 25 20 C27.5 17.5 27.5 13.5 25 11 L20 6 C17.5 3.5 13.5 3.5 11 6 L6 11 Z M11 7.5 L16 12.5 L12.5 16 L7.5 11 C5.5 9 7.5 5.5 11 7.5 Z" />
    </svg>
  ),
  sleep: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M22 3 C16 3 11 8 11 14 C11 20 16 25 22 25 C25 25 28 23.5 30 21 C24 21 19 16.5 19 11 C19 8 20 5.5 22 3 Z" />
    </svg>
  ),
  sex: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M11 24 C11 24 3 18 3 12.5 C3 9.5 5.4 7 8.5 7 C10 7 11 7.7 11.5 8.5 C12 7.7 13 7 14.5 7 C17.6 7 20 9.5 20 12.5 C20 18 11 24 11 24 Z" />
      <path fill={W} d="M22 28 C22 28 14 22 14 16.5 C14 13.5 16.4 11 19.5 11 C21 11 22 11.7 22.5 12.5 C23 11.7 24 11 25.5 11 C28.6 11 31 13.5 31 16.5 C31 22 22 28 22 28 Z" />
    </svg>
  ),
  meditation: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="16" cy="7" r="2.8" />
      <path fill={W} d="M16 11 C13.5 11 11.5 13 11.5 15.5 L11.5 19 L8 22 C6.5 23 6 25 7 26.5 L8 28 L11 25 C12 24 13.5 23.5 14.5 23.5 L17.5 23.5 C18.5 23.5 20 24 21 25 L24 28 L25 26.5 C26 25 25.5 23 24 22 L20.5 19 L20.5 15.5 C20.5 13 18.5 11 16 11 Z" />
    </svg>
  ),
  rest: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="9" cy="10" r="2.5" />
      <path fill={W} d="M3 20 L3 26 L5 26 L5 23 L27 23 L27 26 L29 26 L29 18 C29 16 27.5 14.5 25.5 14.5 L12 14.5 C11 14.5 10 15 9.5 16 L8 18 L4 18 C3.4 18 3 18.5 3 19 Z" />
    </svg>
  ),
  reading: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M3 7 L14 7 C15.5 7 16 8 16 9 L16 27 C16 26 15 25 13.5 25 L3 25 Z M18 9 C18 8 18.5 7 20 7 L29 7 L29 25 L20 25 C18.5 25 18 26 18 27 Z" />
    </svg>
  ),
  desk: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M4 5 L28 5 C29 5 30 6 30 7 L30 21 C30 22 29 23 28 23 L18 23 L18 26 L23 26 L23 28 L9 28 L9 26 L14 26 L14 23 L4 23 C3 23 2 22 2 21 L2 7 C2 6 3 5 4 5 Z M5 8 L5 20 L27 20 L27 8 Z" />
    </svg>
  ),
  physical_work: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M22 3 L29 10 L25 14 L22 11 L20 13 L11 22 L13 24 L11 26 L6 21 L8 19 L6 17 L15 8 L17 6 L19 8 L21 6 L18 3 Z" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M3 6 L29 6 C30 6 30 7 30 8 L30 22 C30 23 29 24 28 24 L4 24 C3 24 2 23 2 22 L2 8 C2 7 3 6 4 6 Z M5 9 L5 21 L27 21 L27 9 Z" />
      <path fill={W} d="M13 12 L13 18 L20 15 Z" />
    </svg>
  ),
  stress: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M16 8 C11.5 8 8 11.5 8 16 C8 18 9 20 10 21 L10 25 C10 26 11 27 12 27 L20 27 C21 27 22 26 22 25 L22 21 C23 20 24 18 24 16 C24 11.5 20.5 8 16 8 Z" />
      <path fill={W} d="M16 3 L16 6 L14.7 6 L14.7 3 Z M5 6 L7 8 L6 9 L4 7 Z M27 6 L25 8 L26 9 L28 7 Z M2 13 L5 13 L5 14.3 L2 14.3 Z M27 13 L30 13 L30 14.3 L27 14.3 Z" />
    </svg>
  ),
  streak_runner: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} cx="13" cy="6" r="2.4" />
      <path fill={W} d="M12 9 C10 9 8.5 10.5 8 12 L6 16 L3 16.5 L3.4 18.5 L7 18 C7.7 17.9 8.3 17.5 8.6 16.9 L9.5 15 L10 17.5 L7.5 21 L4.5 24 L6 25 L9 22 L11 19.5 L12.5 23 L14.5 26 L16 25 L14.5 22.5 L13.5 18.5 L15 16.5 L16.5 18 L18 17 L15.5 13 C14.5 11 13.5 9 12 9 Z" />
      <path fill={W} d="M25 4 L26.3 7.2 L29.7 7.5 L27.1 9.7 L27.9 13 L25 11.2 L22.1 13 L22.9 9.7 L20.3 7.5 L23.7 7.2 Z" />
    </svg>
  ),
  clear: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M16 2 L25 11 L20 30 L12 30 L7 11 Z M11 12 L14 27 L18 27 L21 12 L16 6 Z" />
    </svg>
  ),
  connected: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M12 16 a7 7 0 1 1 0.001 0 z M12 12 a3 3 0 1 0 0.001 0 z" />
      <path fill={W} d="M22 16 a7 7 0 1 1 0.001 0 z M22 12 a3 3 0 1 0 0.001 0 z" />
    </svg>
  ),
  iron_will: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <path fill={W} d="M16 2 L27 5 L27 14 C27 21 22 27 16 30 C10 27 5 21 5 14 L5 5 Z" />
      <rect fill="#1E293B" x="9" y="14" width="2" height="5" rx="0.5" />
      <rect fill="#1E293B" x="21" y="14" width="2" height="5" rx="0.5" />
      <rect fill="#1E293B" x="11" y="16" width="10" height="1.5" />
    </svg>
  ),
  zen_master: (
    <svg viewBox="0 0 32 32" width="60%" height="60%">
      <circle fill={W} fillOpacity="0.25" cx="16" cy="18" r="13" />
      <circle fill={W} fillOpacity="0.4" cx="16" cy="18" r="9" />
      <path fill={W} d="M16 10 C13 14 13 17 16 20 C19 17 19 14 16 10 Z M8 16 C8 20 11 22 16 21 C14 18 12 16 8 16 Z M24 16 C24 20 21 22 16 21 C18 18 20 16 24 16 Z M10 22 C13 23 15 22 16 21 C13 21 11 21 10 22 Z M22 22 C19 23 17 22 16 21 C19 21 21 21 22 22 Z" />
    </svg>
  ),
};

const LockIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
    <path fill="white" d="M12 2 C9 2 6.5 4.5 6.5 7.5 L6.5 10 L5 10 C4 10 3 11 3 12 L3 20 C3 21 4 22 5 22 L19 22 C20 22 21 21 21 20 L21 12 C21 11 20 10 19 10 L17.5 10 L17.5 7.5 C17.5 4.5 15 2 12 2 Z M12 4 C13.9 4 15.5 5.6 15.5 7.5 L15.5 10 L8.5 10 L8.5 7.5 C8.5 5.6 10.1 4 12 4 Z" />
  </svg>
);

export function BoostaToken({
  type,
  size = 88,
  locked = false,
  showLabel = true,
  showSubLabel = true,
  className,
  onClick,
}: BoostaTokenProps) {
  const meta = boostaTokenMeta[type];
  const radius = Math.round(size * 0.22);

  const isGold = meta.rarity === 'gold';
  const isCrystal = meta.rarity === 'crystal';
  const isPair = meta.rarity === 'pair';

  const tileStyle: CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    borderRadius: radius,
    background: meta.color,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    opacity: locked ? 0.6 : 1,
    border: isCrystal ? '2px solid #7C3AED' : isGold ? '2px solid #FCD34D' : isPair ? '2px solid #F472B6' : 'none',
    outline: isPair ? '2px solid #BE185D' : 'none',
    outlineOffset: isPair ? '2px' : undefined,
  };

  const highlightStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: 'rgba(255,255,255,0.12)',
    pointerEvents: 'none',
  };

  const lockOverlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      data-token-type={type}
    >
      <div style={tileStyle} data-rarity={meta.rarity}>
        {TOKEN_ICONS[type]}
        <div style={highlightStyle} />
        {locked && (
          <div style={lockOverlayStyle} data-locked>
            <LockIcon size={Math.round(size * 0.35)} />
          </div>
        )}
      </div>
      {(showLabel || showSubLabel) && (
        <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
          {showLabel && (
            <div style={{ fontWeight: 500, fontSize: 13, color: 'inherit' }}>{meta.labelRu}</div>
          )}
          {showSubLabel && (
            <div style={{ fontSize: 10, textTransform: 'uppercase', opacity: 0.55, letterSpacing: 0.5, marginTop: 2 }}>
              {meta.labelEn}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BoostaToken;
