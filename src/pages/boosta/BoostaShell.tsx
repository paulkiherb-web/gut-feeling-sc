import SwipeShell from '@/components/boosta/nav/SwipeShell';
import ProfileButton from '@/components/boosta/nav/ProfileButton';
import MirrorScreen from './MirrorScreen';
import CheckinScreen from './CheckinScreen';
import HistoryScreen from './HistoryScreen';
import Scanner from '@/pages/Scanner';

export default function BoostaShell() {
  return (
    <>
      <ProfileButton />
      <SwipeShell
        initial={0}
        screens={[
          { id: 'today',   label: 'Сегодня',  node: <MirrorScreen /> },
          { id: 'checkin', label: 'Чек-ин',   node: <CheckinScreen /> },
          { id: 'history', label: 'История',  node: <HistoryScreen /> },
          { id: 'scan',    label: 'Скан',     node: <Scanner /> },
        ]}
      />
    </>
  );
}
