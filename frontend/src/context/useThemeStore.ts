import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
      },
      setTheme: (theme: Theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    { name: 'lioc-theme' }
  )
);

// Initialise attribute on load
const storedRaw = localStorage.getItem('lioc-theme');
const storedTheme: Theme =
  storedRaw ? (JSON.parse(storedRaw)?.state?.theme ?? 'dark') : 'dark';
document.documentElement.setAttribute('data-theme', storedTheme);
