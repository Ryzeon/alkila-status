'use client';

import type { Health, ServiceStatus } from '@/lib/types';
import { healthColor } from './StatusDot';

const HEADLINE: Record<Health, { lead: string; rest: string }> = {
  operational: { lead: 'Todos los servicios', rest: 'operativos' },
  degraded: { lead: 'Servicio', rest: 'degradado' },
  down: { lead: 'Interrupción del', rest: 'servicio' },
  unknown: { lead: 'Estado', rest: 'indeterminado' },
};

const SUBLINE: Record<Health, string> = {
  operational: 'No hay incidencias reportadas.',
  degraded: 'Algunos servicios responden más lento de lo normal.',
  down: 'Estamos trabajando para restablecerlo.',
  unknown: 'No se pudo verificar el estado de todos los servicios.',
};

export function Hero({
  overall,
  services,
  updatedLabel,
  measuredCount,
}: {
  overall: Health;
  services: ServiceStatus[];
  updatedLabel: string;
  measuredCount: number;
}) {
  const color = healthColor(overall);
  const { lead, rest } = HEADLINE[overall];

  const operational = services.filter((service) => service.health === 'operational').length;
  const unmeasured = services.length - measuredCount;

  return (
    <header
      id="top"
      className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-6 pt-36 pb-24 sm:px-10 md:grid-cols-[1.45fr_0.55fr] md:pt-52 md:pb-40"
    >
      <div className="relative">
        {/* Halo que respira detrás del titular, teñido por el estado actual. */}
        <div
          className="halo-breathe pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full blur-3xl"
          style={{ background: `color-mix(in srgb, ${color} 22%, transparent)` }}
          aria-hidden="true"
        />

        <h1
          // max-w en ch + tope de 4.6rem: garantiza que el titular más largo
          // ("Todos los servicios operativos", 30 caracteres) quiebre en 2 líneas.
          className="relative max-w-[19ch] leading-[0.95] font-bold tracking-[-0.035em] text-ink"
          style={{ fontSize: 'clamp(2.75rem, 5vw, 4.6rem)' }}
        >
          {lead}{' '}
          <span className="relative inline-block">
            {rest}
            <span
              className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full"
              style={{ background: color }}
              aria-hidden="true"
            />
          </span>
        </h1>

        <p className="mt-8 max-w-md text-[17px] leading-relaxed text-muted">
          {SUBLINE[overall]}
        </p>

        <div className="mt-10">
          <a
            href="#servicios"
            className="inline-block rounded-full px-6 py-3 text-[15px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--brand)', color: 'var(--brand-ink)' }}
          >
            Ver el detalle
          </a>
        </div>
      </div>

      <div className="relative">
        <div
          className="rounded-xl border border-line p-7 backdrop-blur-xl sm:p-8"
          style={{ background: 'var(--glass)' }}
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${overall === 'operational' ? 'status-pulse' : ''}`}
              style={{ background: color }}
              aria-hidden="true"
            />
            <span className="text-[13px] text-muted">{updatedLabel}</span>
          </div>

          <div className="mt-7 flex items-baseline gap-2">
            <span className="text-6xl font-bold tracking-tighter tabular-nums" style={{ color }}>
              {operational}
            </span>
            <span className="text-xl font-semibold text-faint">/ {services.length}</span>
          </div>
          <p className="mt-1.5 text-[13px] text-muted">servicios operativos</p>

          {/* Sin esto, el titular sobreafirma cuando hay servicios sin verificar. */}
          {unmeasured > 0 && (
            <p className="mt-2.5 text-[13px] font-medium" style={{ color: 'var(--degraded)' }}>
              {unmeasured} sin verificar
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
