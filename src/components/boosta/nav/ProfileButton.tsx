import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import HealthProfile from '@/pages/HealthProfile';
import { boostaTokens } from '@/design/boosta/tokens';

export default function ProfileButton() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Профиль"
          style={{
            position: 'fixed',
            top: 14,
            right: 16,
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: boostaTokens.color.surface.raised,
            border: `0.5px solid ${boostaTokens.color.surface.line}`,
            boxShadow: boostaTokens.shadow.soft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 50,
            padding: 0,
          }}
        >
          <div style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: boostaTokens.color.real[400],
          }} />
        </button>
      </SheetTrigger>
      <SheetContent side="right" style={{ width: '100%', maxWidth: 480, overflow: 'auto', padding: 0 }}>
        <HealthProfile />
      </SheetContent>
    </Sheet>
  );
}
