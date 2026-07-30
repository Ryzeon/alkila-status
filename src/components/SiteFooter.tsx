'use client';

import type { Health, StatusReport } from '@/lib/types';
import { healthColor, healthLabel } from './StatusDot';

const LEGEND: Health[] = ['operational', 'degraded', 'down', 'unknown'];

export function SiteFooter({
  report,
  refreshSeconds,
  onRefresh,
  refreshing,
}: {
  report: StatusReport;
  refreshSeconds: number;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <footer className="mx-auto w-full max-w-7xl px-6 pt-20 pb-16 sm:px-10 md:pt-32">
      <div
        className="rounded-xl border border-line px-8 py-16 text-center backdrop-blur-xl sm:px-12 md:py-24"
        style={{ background: 'var(--glass)' }}
      >
        <h2
          className="mx-auto max-w-[16ch] leading-[0.98] font-bold tracking-[-0.035em] text-ink"
          style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)' }}
        >
          Mide otra vez cuando quieras
        </h2>

        <p className="mx-auto mt-7 max-w-lg text-[16px] leading-relaxed text-muted">
          La página se remide sola cada {refreshSeconds} segundos. Si necesitas una lectura
          fresca ahora mismo, pídela.
        </p>

        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-full px-7 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--brand)', color: 'var(--brand-ink)' }}
          >
            {refreshing ? 'Midiendo' : 'Medir ahora'}
          </button>
          <a
            href="/api/status"
            className="rounded-full border border-line-strong px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-brand"
          >
            Ver el JSON crudo
          </a>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 text-[12px] text-faint md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LEGEND.map((health) => (
            <span key={health} className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: healthColor(health) }}
                aria-hidden="true"
              />
              {healthLabel(health)}
            </span>
          ))}
        </div>

        <span>
          Chequeo en {report.durationMs} ms · barras de esta sesión, sin historial persistido
        </span>
      </div>
    </footer>
  );
}
