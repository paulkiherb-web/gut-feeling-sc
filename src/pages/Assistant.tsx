import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS = [
  'Чем заменить сахар для энергии?',
  'Что съесть перед сном?',
  'Какие БАДы нужны при моём профиле?',
  'Как улучшить режим дня?',
];

export default function Assistant() {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: `Привет! Я ваш AI-помощник по питанию. Знаю ваш профиль (${profile.age} лет, цель: ${profile.goal}) и готов помочь с выбором продуктов, заменами и ритуалами. Спрашивайте!` },
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
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
          chat_mode: true,
          question: text.trim(),
          user_profile: {
            age: profile.age,
            gender: profile.gender,
            condition: profile.condition,
            goal: profile.goal,
            surgery_days: profile.surgeryDays,
            height_cm: profile.heightCm,
            weight_kg: profile.weightKg,
            diets: profile.diets,
          },
          conversation: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        },
      });

      const response = typeof data === 'string' ? data : (data?.reason || data?.answer || JSON.stringify(data));
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Извините, произошла ошибка. Попробуйте переформулировать вопрос.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <OrganicBackground variant="cool" intensity="subtle" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-14 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-premium flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold">AI-Помощник</h1>
            <p className="text-[10px] text-muted-foreground">Вопросы по продуктам, заменам и режиму</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-5 pb-40 space-y-3"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i === messages.length - 1 ? 0 : 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-3.5 ${
              msg.role === 'user'
                ? 'gradient-organic text-primary-foreground rounded-br-md'
                : 'glass-strong rounded-bl-md'
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-semibold opacity-70">
                  {msg.role === 'assistant' ? 'NutriSee AI' : 'Вы'}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-strong rounded-2xl rounded-bl-md p-3.5">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/40"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="fixed bottom-[140px] left-0 right-0 z-20 px-5">
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-3 py-2 rounded-xl glass text-xs font-medium transition-all active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 pt-2">
        <div className="glass-strong rounded-2xl flex items-center gap-2 p-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Спросите о продукте, замене, ритуале..."
            className="flex-1 bg-transparent text-sm outline-none px-3 placeholder:text-muted-foreground/50"
            disabled={loading}
          />
          <Button
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="rounded-xl gradient-organic border-0 h-9 w-9 p-0"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
