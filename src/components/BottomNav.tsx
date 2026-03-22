import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Clock, Sun, User, Sparkles, MessageCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

const TABS = [
  { path: '/scanner', label: 'Главная', icon: Home },
  { path: '/history', label: 'История', icon: Clock },
  { path: '/day', label: 'День', icon: Sun },
  { path: '/profile', label: 'Профиль', icon: User },
] as const;

const MORE_ITEMS = [
  { path: '/intensive', label: 'Интенсив', icon: Sparkles, description: 'Протоколы биохакера' },
  { path: '/assistant', label: 'Помощник', icon: MessageCircle, description: 'AI-консультант' },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isMoreActive = MORE_ITEMS.some(item => location.pathname === item.path);

  return (
    <>
      {/* More menu overlay */}
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
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-20 left-4 right-4 glass-strong rounded-3xl p-3 space-y-1"
              onClick={e => e.stopPropagation()}
            >
              {MORE_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="glass-strong border-t border-border/20 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-3xl">
          <div className="flex items-center justify-around h-16">
            {TABS.map(tab => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.path}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-0.5 w-8 h-0.5 rounded-full gradient-organic"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
            {/* More button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
            >
              {isMoreActive && (
                <motion.div
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full gradient-organic"
                />
              )}
              {menuOpen ? (
                <X className="w-5 h-5 text-primary" />
              ) : (
                <Menu className={`w-5 h-5 transition-colors ${isMoreActive ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
              <span className={`text-[10px] font-semibold transition-colors ${isMoreActive || menuOpen ? 'text-primary' : 'text-muted-foreground'}`}>
                Ещё
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
