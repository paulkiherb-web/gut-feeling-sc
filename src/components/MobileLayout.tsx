import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import OrganicBackground from './OrganicBackground';
import BottomNav from './BottomNav';

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  variant?: 'default' | 'cool' | 'warm';
  hideNav?: boolean;
  noPadding?: boolean;
}

export default function MobileLayout({
  children,
  title,
  subtitle,
  headerRight,
  variant = 'default',
  hideNav = false,
  noPadding = false,
}: Props) {
  return (
    <div className="mobile-screen">
      <OrganicBackground variant={variant} intensity="subtle" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Native-style sticky header */}
        {title && (
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-30 glass-strong border-b border-border/10 safe-top"
          >
            <div className="px-4 pb-2 pt-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="font-display font-extrabold tracking-tight leading-tight text-[clamp(1rem,4.6vw,1.25rem)] truncate">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-[10px] leading-snug text-muted-foreground mt-0.5 line-clamp-2 break-words">
                      {subtitle}
                    </p>
                  )}
                </div>
                {headerRight && <div className="shrink-0">{headerRight}</div>}
              </div>
            </div>
          </motion.header>
        )}

        {/* Scrollable content */}
        <div className={`flex-1 overflow-y-auto overscroll-y-contain ${noPadding ? '' : 'px-4'} pb-24 no-scrollbar`}>
          {!title && <div className="safe-top" />}
          {children}
        </div>
      </div>

      {!hideNav && <BottomNav />}
    </div>
  );
}
