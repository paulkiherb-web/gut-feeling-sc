import SwipeShell from '@/components/boosta/nav/SwipeShell';
import ProfileButton from '@/components/boosta/nav/ProfileButton';
import MirrorScreen from './MirrorScreen';
import CheckinScreen from './CheckinScreen';
import HistoryScreen from './HistoryScreen';
import Scanner from '@/pages/Scanner';
import { useState } from 'react';

export default function BoostaShell() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <>
      <ProfileButton />
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
