'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

// Reads initial theme synchronously from localStorage to avoid flash
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('miralou_theme') as Theme | null;
  return saved ?? 'dark';
}

function applyTheme(t: Theme) {
  const html = document.documentElement;
  // Remove both, then add the right one
  html.classList.remove('dark', 'light');
  html.classList.add(t);
  // Also sync body background immediately for instant feedback
  document.body.style.backgroundColor = t === 'light' ? '#f2f2f2' : '#121212';
  document.body.style.color = t === 'light' ? '#0a0a0a' : '#f4f4f5';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Apply saved theme immediately on mount (client only)
  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('miralou_theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
