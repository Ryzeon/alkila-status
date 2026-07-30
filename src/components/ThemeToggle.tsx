'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'alkila-status-theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // El tema real ya lo fijó el script inline del layout; aquí solo lo leemos
  // para sincronizar el estado de React tras la hidratación.
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'light' : 'dark');
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);

    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Modo privado sin localStorage: el tema simplemente no persiste.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-line bg-surface-2 px-3 py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-ink"
      aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
