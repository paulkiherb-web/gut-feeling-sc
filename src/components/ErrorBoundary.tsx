import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Catches unhandled React render errors and shows a recovery screen.
 * Wrap crash-prone screens with this so the user never gets a blank white page.
 * Use key={someId} on the boundary to reset it when context changes (e.g. tab switch).
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60dvh',
          background: '#F5F2EC', color: '#1f1d1a',
          padding: '32px 24px', textAlign: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Что-то пошло не так</div>
          <div style={{ fontSize: 14, color: '#8a8070', lineHeight: 1.5 }}>
            Экран завис. Нажми кнопку ниже чтобы вернуться.
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              padding: '14px 28px', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #6E56FF, #44C7A8)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Вернуться назад
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
