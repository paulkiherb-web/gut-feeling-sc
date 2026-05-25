import { motion } from 'framer-motion';
import { Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScanCTAButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate('/scanner')}
      className="w-full flex items-center justify-center gap-2.5 gradient-organic rounded-2xl py-4 shadow-md shadow-primary/20 active:shadow-none transition-shadow"
    >
      <Scan className="w-5 h-5 text-primary-foreground" strokeWidth={2.4} />
      <span className="font-display font-bold text-[15px] text-primary-foreground">
        Сканировать выбор
      </span>
    </motion.button>
  );
}
