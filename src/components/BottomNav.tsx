import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scan, Clock, Activity, User } from 'lucide-react';

const TABS = [
  { path: '/scanner', label: 'Scan', icon: Scan },
  { path: '/history', label: 'History', icon: Clock },
  { path: '/health', label: 'Health', icon: Activity },
  { path: '/profile', label: 'Profile', icon: User },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-strong border-t border-border/20 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-3xl">
        <div className="flex items-center justify-around h-16">
          {TABS.map(tab => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.path}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 relative"
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
        </div>
      </div>
    </div>
  );
}
