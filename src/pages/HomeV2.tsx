import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import CourseChip from '@/components/home-v2/CourseChip';
import DayQuestionCard from '@/components/home-v2/DayQuestionCard';
import MirrorBlock from '@/components/home-v2/MirrorBlock';
import ScanCTAButton from '@/components/home-v2/ScanCTAButton';
import QuickLogPanel from '@/components/state/QuickLogPanel';
import { useAppStore } from '@/core/store/appStore';

const buildDayKey = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toDateString();
};

const getScanCountLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'скан';
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'скана';
  }

  return 'сканов';
};

export default function HomeV2() {
  const navigate = useNavigate();
  const [quickLog, setQuickLog] = useState(false);

  const eventLog = useAppStore((s) => s.eventLog);
  const todayKey = new Date().toDateString();
  const scanEvents = eventLog.filter((event) => event.type === 'scan.completed');

  const hasHistory = scanEvents.length >= 5;
  const scanCount = scanEvents.filter((event) => {
    const dayKey = buildDayKey(event.createdAt ?? event.timestamp ?? '');
    return dayKey === todayKey;
  }).length;

  return (
    <MobileLayout title="" hideNav={false} noPadding variant="default">
      <div className="px-5 pt-3 pb-28 safe-top space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-display font-black text-[19px] tracking-tight">Boosta</span>
          <button
            onClick={() => navigate('/paywall')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(45 95% 60% / 0.18), hsl(36 92% 56% / 0.10))',
              border: '1px solid hsl(45 95% 60% / 0.4)',
            }}
          >
            <Crown className="w-3 h-3" style={{ color: 'hsl(42 95% 55%)' }} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'hsl(42 90% 50%)' }}
            >
              Премиум
            </span>
          </button>
        </div>

        <CourseChip />

        <MirrorBlock hasHistory={hasHistory} />

        <DayQuestionCard hasHistory={hasHistory} />

        <ScanCTAButton />

        <p className="text-[11px] text-muted-foreground text-center leading-snug">
          {scanCount > 0
            ? `${scanCount} ${getScanCountLabel(scanCount)} сегодня`
            : 'Каждый скан делает зеркало точнее'}
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => setQuickLog(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full gradient-organic shadow-xl shadow-primary/30 flex items-center justify-center glow-primary"
      >
        <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
      </motion.button>

      <QuickLogPanel open={quickLog} onClose={() => setQuickLog(false)} />
    </MobileLayout>
  );
}
