import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { Activity, TrendingUp, TrendingDown, Minus, Heart, Scale, Zap } from 'lucide-react';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

// Mock biomarker data
const MOCK_GLUCOSE = [
  { day: 'Mon', value: 95 }, { day: 'Tue', value: 102 }, { day: 'Wed', value: 88 },
  { day: 'Thu', value: 91 }, { day: 'Fri', value: 97 }, { day: 'Sat', value: 85 }, { day: 'Sun', value: 90 },
];
const MOCK_HRV = [
  { day: 'Mon', value: 42 }, { day: 'Tue', value: 45 }, { day: 'Wed', value: 50 },
  { day: 'Thu', value: 48 }, { day: 'Fri', value: 55 }, { day: 'Sat', value: 52 }, { day: 'Sun', value: 58 },
];
const MOCK_WEIGHT = [
  { day: 'Mon', value: 72.5 }, { day: 'Tue', value: 72.3 }, { day: 'Wed', value: 72.1 },
  { day: 'Thu', value: 72.0 }, { day: 'Fri', value: 71.8 }, { day: 'Sat', value: 71.9 }, { day: 'Sun', value: 71.6 },
];

interface BiomarkerData {
  day: string;
  value: number;
}

function MiniChart({ data, color }: { data: BiomarkerData[]; color: string }) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const h = 48;
  const w = 160;
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
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#grad-${color})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
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

export default function Health() {
  const { profile } = useProfile();
  const h = profile.heightCm || 170;
  const w = profile.weightKg || 70;
  const bmi = w / ((h / 100) ** 2);

  const biomarkers = [
    {
      label: 'Glucose',
      value: MOCK_GLUCOSE[MOCK_GLUCOSE.length - 1].value,
      unit: 'mg/dL',
      icon: Zap,
      data: MOCK_GLUCOSE,
      color: 'hsl(155, 72%, 40%)',
      normal: '70-100',
    },
    {
      label: 'HRV',
      value: MOCK_HRV[MOCK_HRV.length - 1].value,
      unit: 'ms',
      icon: Heart,
      data: MOCK_HRV,
      color: 'hsl(280, 50%, 60%)',
      normal: '40-60',
    },
    {
      label: 'Weight',
      value: MOCK_WEIGHT[MOCK_WEIGHT.length - 1].value,
      unit: 'kg',
      icon: Scale,
      data: MOCK_WEIGHT,
      color: 'hsl(200, 50%, 45%)',
      normal: '—',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <OrganicBackground variant="cool" intensity="subtle" />
      <div className="relative z-10 px-5 pt-14">
        <h1 className="text-2xl font-display font-extrabold tracking-tight mb-1">Health</h1>
        <p className="text-sm text-muted-foreground mb-6">Your biomarker trends</p>

        {/* BMI Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-glow rounded-3xl p-5 mb-5 flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl gradient-organic flex items-center justify-center">
            <Activity className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">BMI</p>
            <p className="text-3xl font-display font-bold text-primary">{bmi.toFixed(1)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{h} cm</p>
            <p className="text-sm font-medium">{w} kg</p>
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
                transition={{ delay: 0.05 + idx * 0.08 }}
                className="glass-strong rounded-3xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground/70" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{bio.label}</p>
                      <p className="text-[10px] text-muted-foreground">Normal: {bio.normal}</p>
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
            📊 Biomarker data is mocked for demo. Connect wearables for real-time tracking.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
