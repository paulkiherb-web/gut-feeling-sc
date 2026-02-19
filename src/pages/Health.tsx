import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Activity, TrendingUp, TrendingDown, Minus, Heart, Scale, Zap, PieChart } from 'lucide-react';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

interface BiomarkerData { day: string; value: number; }

function MiniChart({ data, color }: { data: BiomarkerData[]; color: string }) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const h = 48, w = 160;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.value - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const last = data[data.length - 1];
        const x = w;
        const y = h - ((last.value - min) / range) * (h - 8) - 4;
        return <circle cx={x} cy={y} r="3" fill={color} />;
      })()}
    </svg>
  );
}

function TrendBadge({ data }: { data: BiomarkerData[] }) {
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const diff = ((last - first) / first) * 100;
  const isUp = diff > 0.5;
  const isDown = diff < -0.5;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
      isUp ? 'bg-safe/15 text-safe' : isDown ? 'bg-danger/15 text-danger' : 'bg-muted text-muted-foreground'
    }`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {Math.abs(diff).toFixed(1)}%
    </span>
  );
}

// Mock biomarker data (since no biomarkers table data yet)
const MOCK_GLUCOSE: BiomarkerData[] = [
  { day: 'Пн', value: 95 }, { day: 'Вт', value: 102 }, { day: 'Ср', value: 88 },
  { day: 'Чт', value: 91 }, { day: 'Пт', value: 97 }, { day: 'Сб', value: 85 }, { day: 'Вс', value: 90 },
];
const MOCK_HRV: BiomarkerData[] = [
  { day: 'Пн', value: 42 }, { day: 'Вт', value: 45 }, { day: 'Ср', value: 50 },
  { day: 'Чт', value: 48 }, { day: 'Пт', value: 55 }, { day: 'Сб', value: 52 }, { day: 'Вс', value: 58 },
];
const MOCK_WEIGHT: BiomarkerData[] = [
  { day: 'Пн', value: 72.5 }, { day: 'Вт', value: 72.3 }, { day: 'Ср', value: 72.1 },
  { day: 'Чт', value: 72.0 }, { day: 'Пт', value: 71.8 }, { day: 'Сб', value: 71.9 }, { day: 'Вс', value: 71.6 },
];

export default function Health() {
  const { profile } = useProfile();
  const [scanStats, setScanStats] = useState({ total: 0, green: 0, yellow: 0, red: 0 });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('scans')
          .select('verdict')
          .eq('user_id', user.id);
        if (data) {
          setScanStats({
            total: data.length,
            green: data.filter(s => s.verdict === 'green').length,
            yellow: data.filter(s => s.verdict === 'yellow').length,
            red: data.filter(s => s.verdict === 'red').length,
          });
        }
      }
    })();
  }, []);

  const h = profile.heightCm || 170;
  const w = profile.weightKg || 70;
  const bmi = w / ((h / 100) ** 2);
  const bmiLabel = bmi < 18.5 ? 'Недовес' : bmi < 25 ? 'Норма' : bmi < 30 ? 'Избыток' : 'Ожирение';

  const biomarkers = [
    { label: 'Глюкоза', value: MOCK_GLUCOSE[6].value, unit: 'мг/дл', icon: Zap, data: MOCK_GLUCOSE, color: 'hsl(155, 72%, 40%)', normal: '70–100' },
    { label: 'ВСР', value: MOCK_HRV[6].value, unit: 'мс', icon: Heart, data: MOCK_HRV, color: 'hsl(280, 50%, 60%)', normal: '40–60' },
    { label: 'Вес', value: MOCK_WEIGHT[6].value, unit: 'кг', icon: Scale, data: MOCK_WEIGHT, color: 'hsl(200, 50%, 45%)', normal: '—' },
  ];

  const safePercent = scanStats.total > 0 ? Math.round((scanStats.green / scanStats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <OrganicBackground variant="cool" intensity="subtle" />
      <div className="relative z-10 px-5 pt-14">
        <h1 className="text-2xl font-display font-extrabold tracking-tight mb-1">Здоровье</h1>
        <p className="text-sm text-muted-foreground mb-6">Ваши биомаркеры и статистика</p>

        {/* Scan Statistics — real data */}
        {scanStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-glow rounded-3xl p-5 mb-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-organic flex items-center justify-center">
                <PieChart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Общая статистика</p>
                <p className="text-sm font-medium">{scanStats.total} сканов · {safePercent}% безопасных</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-safe/10 p-3 text-center">
                <p className="text-xl font-display font-bold text-safe">{scanStats.green}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">Безопасно</p>
              </div>
              <div className="rounded-2xl bg-warning/10 p-3 text-center">
                <p className="text-xl font-display font-bold text-warning">{scanStats.yellow}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">Осторожно</p>
              </div>
              <div className="rounded-2xl bg-danger/10 p-3 text-center">
                <p className="text-xl font-display font-bold text-danger">{scanStats.red}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">Избегать</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* BMI Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-glow rounded-3xl p-5 mb-5 flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl gradient-organic flex items-center justify-center">
            <Activity className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">ИМТ</p>
            <p className="text-3xl font-display font-bold text-primary">{bmi.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">{bmiLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{h} см</p>
            <p className="text-sm font-medium">{w} кг</p>
          </div>
        </motion.div>

        {/* Biomarker Cards */}
        <div className="space-y-4">
          {biomarkers.map((bio, idx) => {
            const Icon = bio.icon;
            return (
              <motion.div
                key={bio.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                className="glass-strong rounded-3xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground/70" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{bio.label}</p>
                      <p className="text-[10px] text-muted-foreground">Норма: {bio.normal}</p>
                    </div>
                  </div>
                  <TrendBadge data={bio.data} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-display font-bold">{bio.value}</span>
                    <span className="text-sm text-muted-foreground ml-1">{bio.unit}</span>
                  </div>
                  <MiniChart data={bio.data} color={bio.color} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="glass rounded-2xl p-4 mt-5">
          <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
            📊 Биомаркеры показаны для демо. Подключите носимые устройства для реального отслеживания.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
