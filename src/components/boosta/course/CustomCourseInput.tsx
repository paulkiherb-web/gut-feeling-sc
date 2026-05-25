import { boostaTokens } from '@/design/boosta/tokens';
import { useState } from 'react';

interface Props {
  onSubmit?: (value: string) => void;
  placeholder?: string;
}

export default function CustomCourseInput({ onSubmit, placeholder = 'Свой курс…' }: Props) {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={() => value && onSubmit?.(value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: boostaTokens.color.surface.raised,
        border: `0.5px solid ${boostaTokens.color.surface.line}`,
        borderRadius: boostaTokens.radius.md,
        fontSize: 14,
        color: boostaTokens.color.surface.ink,
        outline: 'none',
      }}
    />
  );
}
