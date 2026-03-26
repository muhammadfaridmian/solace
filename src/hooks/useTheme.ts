import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useStore();

  useEffect(() => {
    const stored = localStorage.getItem('solace-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const savedTheme = parsed?.state?.theme;
        if (savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
          return;
        }
      } catch {
        /* ignore */
      }
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = prefersDark ? 'dark' : 'light';
    // Default to light if no system preference or no stored value
    document.documentElement.setAttribute('data-theme', initial);
    setTheme(initial);
  }, [setTheme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('solace-storage');
      if (!stored) {
        const t = e.matches ? 'dark' : 'light';
        setTheme(t);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
