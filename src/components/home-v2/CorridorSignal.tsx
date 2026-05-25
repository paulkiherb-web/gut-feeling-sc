interface CorridorSignalProps {
  score: number;
}

export default function CorridorSignal({ score }: CorridorSignalProps) {
  const normalizedScore = Math.max(0, Math.min(5, Math.round(score)));

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-500"
          style={{
            background: i < normalizedScore
              ? 'hsl(var(--safe))'
              : 'hsl(var(--border))',
          }}
        />
      ))}
    </div>
  );
}
