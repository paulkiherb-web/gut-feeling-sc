import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function LegacyRedirect() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-5">
      <div className="w-14 h-14 rounded-2xl gradient-organic flex items-center justify-center shadow-lg">
        <Compass className="w-7 h-7 text-primary-foreground" strokeWidth={2.3} />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-display font-bold">
          {t('legacy.title')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          {t('legacy.description')}
        </p>
      </div>

      <button
        onClick={() => navigate('/home')}
        className="px-6 py-3 rounded-2xl gradient-organic text-primary-foreground font-semibold text-sm shadow-lg active:scale-95 transition"
      >
        {t('legacy.cta')}
      </button>
    </div>
  );
}
