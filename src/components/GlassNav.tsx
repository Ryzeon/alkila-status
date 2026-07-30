'use client';

import { AlkilaMark } from './AlkilaMark';
import { ThemeToggle } from './ThemeToggle';

/** Píldora flotante de vidrio, anclada al tope del viewport. */
export function GlassNav({
  onRefresh,
  refreshing,
}: {
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <nav className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <div
        className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-full border border-line py-2 pr-2 pl-3 backdrop-blur-xl sm:pl-5"
        style={{ background: 'var(--glass)' }}
      >
        <a href="#top" className="flex items-center gap-2.5">
          <span
            className="grid h-7 w-7 place-items-center rounded-full"
            style={{ background: 'var(--brand)', color: 'var(--brand-ink)' }}
            aria-hidden="true"
          >
            <AlkilaMark className="h-[15px] w-[15px]" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">Alkila</span>
        </a>

        <div className="flex items-center gap-1.5">
          <a
            href="#servicios"
            className="hidden rounded-full px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-ink sm:block"
          >
            Servicios
          </a>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--brand)', color: 'var(--brand-ink)' }}
          >
            {refreshing ? 'Actualizando' : 'Actualizar'}
          </button>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
