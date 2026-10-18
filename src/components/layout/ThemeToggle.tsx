'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { SunIcon, MoonIcon } from '@/components/ui/Icons';
import { useMounted } from '@/lib/useMounted';

export function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const mounted = useMounted();

  useEffect(() => {
    // Sync with DOM class initialized by inline script in layout
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, [setTheme]);

  if (!mounted) {
    return (
      <button
        type="button"
        className="w-9 h-9 rounded-md border border-white/10 flex items-center justify-center text-slate-400 bg-white/5 opacity-50"
        aria-label="Toggle display theme"
        disabled
      >
        <MoonIcon size={16} />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-md border border-slate-300 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-cyan-400 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <SunIcon size={17} className="text-cyan-400 animate-in fade-in duration-200" />
      ) : (
        <MoonIcon size={17} className="text-slate-800 animate-in fade-in duration-200" />
      )}
    </button>
  );
}
