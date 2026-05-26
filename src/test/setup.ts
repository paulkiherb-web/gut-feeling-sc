import "@testing-library/jest-dom";
import { vi } from 'vitest';

// Mock framer-motion to avoid animation-related test timeouts
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, tag: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const React = require('react') as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return React.forwardRef((props: any, ref: any) => {
        const { children, ...rest } = props;
        // Strip framer-motion-specific props
        const domProps = Object.fromEntries(
          Object.entries(rest).filter(([k]) =>
            !['initial','animate','exit','variants','transition','whileHover',
              'whileTap','whileFocus','whileInView','layoutId','layout',
              'drag','dragConstraints','onDrag','onDragEnd','onDragStart'].includes(k)
          )
        );
        return React.createElement(tag, { ...domProps, ref }, children);
      });
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
  useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
  useTransform: vi.fn(),
  useSpring: vi.fn(),
  useScroll: () => ({ scrollY: { get: () => 0 }, scrollX: { get: () => 0 } }),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
