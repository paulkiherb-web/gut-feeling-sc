import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Scan, Clock, Sun, User, MessageCircle, Menu, X } from 'lucide-react';
import { useState, forwardRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';

const BottomNav = forwardRef<HTMLDivElement>(function BottomNav(_, ref) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

  const TABS = [
    { path: '/intensive', label: t('nav.home'), icon: Sparkles },
    { path: '/scanner', label: t('nav.scan'), icon: Scan },
    { path: '/history', label: t('nav.history'), icon: Clock },
    { path: '/day', label: t('nav.day'), icon: Sun },
  ] as const;

  const MORE_ITEMS = [
    { path: '/assistant', label: t('nav.assistant'), icon: MessageCircle, description: 'AI' },
    { path: '/profile', label: t('nav.profile'), icon: User, description: '' },
  ] as const;

  const isMoreActive = MORE_ITEMS.some(item => location.pathname === item.path);

  return (
    <div ref={ref}>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 right-4 glass-strong rounded-2xl p-2 space-y-0.5 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              {MORE_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.97] ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-foreground active:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">{item.label}</p>
                      {item.description && <p className="text-[10px] text-muted-foreground">{item.description}</p>}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="glass-strong border-t border-border/10 backdrop-blur-3xl">
          <div className="flex items-stretch justify-around safe-bottom">
            {TABS.map(tab => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.path}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => navigate(tab.path)}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute top-0 w-10 h-[3px] rounded-full gradient-organic"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className={`w-[22px] h-[22px] transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
                  <span className={`text-[10px] font-semibold transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative"
            >
              {isMoreActive && (
                <motion.div className="absolute top-0 w-10 h-[3px] rounded-full gradient-organic" />
              )}
              {menuOpen ? (
                <X className="w-[22px] h-[22px] text-primary" />
              ) : (
                <Menu className={`w-[22px] h-[22px] transition-colors duration-200 ${isMoreActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
              )}
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${isMoreActive || menuOpen ? 'text-primary' : 'text-muted-foreground/60'}`}>
                {t('nav.more')}
              </span>
            </motion.button>
          </div>
        </div>
      </nav>
    </div>
  );
});

export default BottomNav;
