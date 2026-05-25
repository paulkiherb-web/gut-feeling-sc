import SwipeShell from '@/components/boosta/nav/SwipeShell';
import ProfileButton from '@/components/boosta/nav/ProfileButton';
import BoostaLogo from '@/components/boosta/BoostaLogo';
import MirrorScreen from './MirrorScreen';
import HistoryScreen from './HistoryScreen';
import Scanner from '@/pages/Scanner';
import BoostaProfile from './social/BoostaProfile';
import StoryComposer from './social/StoryComposer';
import { useEffect, useState } from 'react';
import { scheduleEveningReminder, requestPermission } from '@/core/boosta/notifications';
import { boostaTokens } from '@/design/boosta/tokens';

export default function BoostaShell() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    requestPermission().then(() => scheduleEveningReminder());
  }, []);

  return (
    <>
      <ProfileButton />
      <div style={{ position: 'fixed', top: 7, left: 16, zIndex: 50 }}>
        <BoostaLogo size="xl" />
      </div>
      <button
        onClick={() => setProfileOpen(true)}
        aria-label="Профиль"
        style={{
          position: 'fixed', top: 14, right: 60, zIndex: 50,
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, color: boostaTokens.color.surface.inkSoft,
        }}
      >
        Я
      </button>
      <button
        onClick={() => setShareOpen(true)}
        aria-label="Поделиться"
        style={{
          position: 'fixed', top: 14, right: 100, zIndex: 50,
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, color: boostaTokens.color.surface.inkSoft,
        }}
      >
        ↗
      </button>
      <SwipeShell
        initial={0}
        activeIdx={activeIdx}
        onIndexChange={setActiveIdx}
        screens={[
          { id: 'today',   label: 'Сегодня',  node: <MirrorScreen onScanPress={() => setActiveIdx(2)} /> },
          { id: 'history', label: 'История',  node: <HistoryScreen /> },
          { id: 'scan',    label: 'Скан',     node: <Scanner boostaMode={true} /> },
        ]}
      />

      {profileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(31,29,26,0.5)',
        }} onClick={() => setProfileOpen(false)}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: boostaTokens.color.surface.base,
            borderRadius: '24px 24px 0 0',
            padding: '24px 20px 48px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <BoostaProfile onClose={() => setProfileOpen(false)} />
          </div>
        </div>
      )}

      {shareOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(31,29,26,0.5)',
        }} onClick={() => setShareOpen(false)}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: boostaTokens.color.surface.base,
            borderRadius: '24px 24px 0 0',
            padding: '24px 20px 48px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <StoryComposer onClose={() => setShareOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
