interface DayQuestionCardProps {
  hasHistory: boolean;
}

const DEFAULT_QUESTION = 'Ты уже что-то съел или выпил сегодня утром?';
const PERSONAL_QUESTION = 'Ты обычно не завтракаешь по вторникам. Сегодня тоже или что-то изменилось?';

export default function DayQuestionCard({ hasHistory }: DayQuestionCardProps) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-4 space-y-1.5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
        Вопрос дня
      </p>
      <p className="text-[14px] text-foreground leading-snug">
        {hasHistory ? PERSONAL_QUESTION : DEFAULT_QUESTION}
      </p>
    </div>
  );
}
