import SwipeShell from '@/components/boosta/nav/SwipeShell';
import ProfileButton from '@/components/boosta/nav/ProfileButton';
import BoostaLogo from '@/components/boosta/BoostaLogo';
import MirrorScreen from './MirrorScreen';
import CheckinScreen from './CheckinScreen';
import HistoryScreen from './HistoryScreen';
import Scanner from '@/pages/Scanner';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleEveningReminder, requestPermission } from '@/core/boosta/notifications';
import { boostaTokens } from '@/design/boosta/tokens';

export default function BoostaShell() {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);

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
        onClick={() => navigate('/boosta/profile')}
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
        onClick={() => navigate('/boosta/share')}
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
          { id: 'today',   label: 'Сегодня',  node: <MirrorScreen onScanPress={() => setActiveIdx(3)} /> },
          { id: 'checkin', label: 'Чек-ин',   node: <CheckinScreen /> },
          { id: 'history', label: 'История',  node: <HistoryScreen /> },
          { id: 'scan',    label: 'Скан',     node: <Scanner boostaMode={true} /> },
        ]}
      />
    </>
  );
}
