import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface Props {
  children: React.ReactNode;
}

export default function DayDetailsAccordion({ children }: Props) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div
      className="rounded-2xl border border-border/25 bg-card/30 overflow-hidden"
      data-testid="day-details-accordion"
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-card/50 transition-colors"
        aria-expanded={open}
      >
        <div>
          <p className="text-[13px] font-display font-semibold leading-tight">
            {t('home.day_details.title')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {t('home.day_details.subtitle')}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="shrink-0 ml-2"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="details-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
            data-testid="day-details-content"
          >
            <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
