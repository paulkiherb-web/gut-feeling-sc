import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { GOALS } from '@/types/profile';
import { Send, Bot, User, Sparkles, ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { useAppStore } from '@/core/store/appStore';
import { useScores } from '@/core/hooks/useScores';
import { useStateSnapshot } from '@/core/hooks/useStateSnapshot';
import { usePredictions } from '@/core/hooks/usePredictions';
import { useRecommendations } from '@/core/hooks/useRecommendations';
import { filterToday } from '@/core/store/calculators/_helpers';
import { buildBehavioralFingerprint } from '@/core/capture/buildBehavioralFingerprint';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS = [
  'Чем заменить сахар?',
  'Что съесть перед сном?',
  'Какие БАДы нужны?',
  'Собери мне план на сегодня',
  'Что добрать по белку?',
];

function inlineParse(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMarkdown(content: string): ReactNode {
  const lines = content.split('\n');
  const nodes: ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (!listBuffer.length) return;
    if (listType === 'ul') {
      nodes.push(
        <ul key={nodes.length} className="list-disc list-inside space-y-0.5 my-1 pl-1">
          {listBuffer.map((item, i) => <li key={i} className="text-sm leading-relaxed">{inlineParse(item)}</li>)}
        </ul>
      );
    } else {
      nodes.push(
        <ol key={nodes.length} className="list-decimal list-inside space-y-0.5 my-1 pl-1">
          {listBuffer.map((item, i) => <li key={i} className="text-sm leading-relaxed">{inlineParse(item)}</li>)}
        </ol>
      );
    }
    listBuffer = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const ulMatch = line.match(/^[*\-]\s+(.*)/);
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    const h1Match = line.match(/^#+\s+(.*)/);

    if (ulMatch) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listBuffer.push(ulMatch[1]);
    } else if (olMatch) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listBuffer.push(olMatch[1]);
    } else {
      flushList();
      if (h1Match) {
        nodes.push(<p key={i} className="text-sm font-semibold leading-relaxed mt-1">{inlineParse(h1Match[1])}</p>);
      } else if (line.trim()) {
        nodes.push(<p key={i} className="text-sm leading-relaxed">{inlineParse(line)}</p>);
      } else if (nodes.length > 0) {
        nodes.push(<div key={i} className="h-1.5" />);
      }
    }
  });
  flushList();
  return <>{nodes}</>;
}

export default function Assistant() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const goal = GOALS.find(g => g.value === profile.goal);
  const eventLog = useAppStore(s => s.events);
  const goals = useAppStore(s => s.goals);
  const longitudinal = useAppStore(s => s.longitudinal);
  const scores = useScores();
  const { snapshot } = useStateSnapshot();
  const { predictions } = usePredictions();
  const { recommendations } = useRecommendations();

  const buildStateContext = () => {
    if (!snapshot) return undefined;

    // Additive: behavioral fingerprint context
    const fingerprint = buildBehavioralFingerprint(eventLog, goals);

    return {
      scores,
      predictions: predictions.map(p => ({ label: p.title, risk: Math.round(p.score) })),
      todayEvents: filterToday(eventLog).slice(-10).map(e => ({
        type: e.type,
        at: e.createdAt,
        summary: e.type.replace('.', ' ').replace('_', ' '),
      })),
      activeRecommendations: recommendations
        .filter(r => r.status === 'active')
        .slice(0, 3)
        .map(r => ({ title: r.title, category: r.category })),
      // Behavioral intelligence — additive layer
      behavioral: {
        type: fingerprint.primaryBehavioralType,
        summary: fingerprint.summary,
        adherence: fingerprint.adherenceScore,
        strengths: fingerprint.strengths.slice(0, 2),
        weaknesses: fingerprint.weaknesses.slice(0, 2),
        riskBehaviors: fingerprint.riskBehaviors.slice(0, 2),
        positiveBehaviorLoops: fingerprint.positiveBehaviorLoops.slice(0, 2),
      },
      // Longitudinal intelligence — additive, guarded
      ...(longitudinal?.isDataSufficient ? {
        longitudinal: {
          recurringPatterns: longitudinal.recurringPatterns.slice(0, 4).map(p => ({
            title: p.title,
            strength: p.strength,
            confidence: p.confidence,
          })),
          dominantSensitivities: longitudinal.personalSignature.dominantFactors.map(f => ({
            factor: f.factor,
            weight: f.weight,
          })),
          driftSignals: longitudinal.driftSignals
            .filter(d => d.urgency !== 'low')
            .slice(0, 3)
            .map(d => ({ domain: d.domain, direction: d.direction, title: d.title })),
          recoveryLagDays: longitudinal.personalSignature.recoveryProfile.lagDays,
        },
      } : {}),
    };
  };
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: `Привет! Я знаю ваш профиль (${profile.age} лет, цель: ${goal?.label}). Спрашивайте о продуктах, заменах, ритуалах или текущем дне.` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await supabase.functions.invoke('analyze-food', {
        body: {
          chat_mode: true,
          question: text.trim(),
          user_profile: {
            age: profile.age, gender: profile.gender, condition: profile.condition,
            goal: profile.goal, surgery_days: profile.surgeryDays,
            height_cm: profile.heightCm, weight_kg: profile.weightKg, diets: profile.diets,
          },
          state_context: buildStateContext(),
          conversation: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        },
      });
      const response = typeof data === 'string' ? data : (data?.reason || data?.answer || JSON.stringify(data));
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Ошибка. Попробуйте переформулировать.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout hideNav noPadding>
      {/* Native header with back */}
      <div className="glass-strong border-b border-border/10 safe-top px-4 pb-2 pt-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl glass flex items-center justify-center tap-card">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl gradient-deep flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-display font-bold">AI-Помощник</h1>
            <p className="text-[10px] text-muted-foreground">Продукты · замены · ритуалы · день</p>
          </div>
          {snapshot && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl glass">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-primary">{scores.readiness}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 no-scrollbar" style={{ height: 'calc(100dvh - 8rem)' }}>
        {messages.map(msg => (
          <motion.div key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] rounded-2xl p-3.5 ${
              msg.role === 'user'
                ? 'gradient-organic text-primary-foreground rounded-br-md'
                : 'glass-premium rounded-bl-md'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                {msg.role === 'assistant' ? <Bot className="w-3 h-3 text-primary" /> : <User className="w-3 h-3" />}
                <span className="text-[9px] font-bold opacity-50">
                  {msg.role === 'assistant' ? 'NutriSee AI' : 'Вы'}
                </span>
              </div>
              <div className="text-sm leading-relaxed">
                {msg.role === 'assistant' ? renderMarkdown(msg.content) : <p className="whitespace-pre-wrap">{msg.content}</p>}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass-premium rounded-2xl rounded-bl-md p-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick action chips */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="px-3 py-2 rounded-xl glass-premium text-[11px] font-medium tap-card">
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="glass-strong border-t border-border/10 px-3 py-2.5 safe-bottom">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Спросите о продукте, замене, ритуале..."
            className="flex-1 bg-transparent text-sm outline-none px-2 placeholder:text-muted-foreground/40"
            disabled={loading}
          />
          <Button size="sm" onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="rounded-xl gradient-organic border-0 h-9 w-9 p-0 shrink-0 shadow-sm">
            <Send className="w-4 h-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
