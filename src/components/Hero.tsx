'use client';

import type { Health, ServiceStatus } from '@/lib/types';
import { healthColor } from './StatusDot';

const HEADLINE: Record<Health, { lead: string; rest: string }> = {
  operational: { lead: 'Todos los sistemas', rest: 'operativos' },
  degraded: { lead: 'Rendimiento', rest: 'degradado' },
  down: { lead: 'Interrupción del', rest: 'servicio' },
  unknown: { lead: 'Estado', rest: 'indeterminado' },
};

/**
 * Hero Editorial Split: veredicto a la izquierda con enorme espacio negativo,
 * lectura en vivo a la derecha. El veredicto ES el hero de un status page —
 * es lo único que alguien viene a leer cuando algo huele mal.
 */
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

  const latencies = services
    .map((service) => service.latencyMs)
    .filter((value): value is number => value !== undefined);

  const median = latencies.length
    ? [...latencies].sort((a, b) => a - b)[Math.floor(latencies.length / 2)]
    : null;

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
          // ("Todos los sistemas operativos", 29 caracteres) quiebre en 2 líneas.
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
          Medido desde fuera de la infraestructura, cada 30 segundos. Si el servidor cae
          entero, esta página sigue midiendo y lo dice.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#componentes"
            className="rounded-full px-6 py-3 text-[15px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--brand)', color: 'var(--brand-ink)' }}
          >
            Ver los {services.length} componentes
          </a>
          <a
            href="#latencia"
            className="rounded-full border border-line-strong px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:border-brand"
          >
            Latencia en detalle
          </a>
        </div>
      </div>

      {/* Lectura en vivo — deliberadamente fuera del bloque de titular. */}
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
            <span
              className="text-6xl font-bold tracking-tighter tabular-nums"
              style={{ color }}
            >
              {measuredCount}
            </span>
            <span className="text-xl font-semibold text-faint">/ {services.length}</span>
          </div>
          <p className="mt-1.5 text-[13px] text-muted">componentes midiéndose ahora</p>

          {/* Sin esto, el titular "Todos los sistemas operativos" sobreafirma
              cuando hay componentes que nadie está midiendo. */}
          {unmeasured > 0 && (
            <p className="mt-2.5 text-[13px] font-medium" style={{ color: 'var(--degraded)' }}>
              {unmeasured} sin medir — su estado se desconoce
            </p>
          )}

          {median !== null && (
            <div className="mt-7 border-t border-line pt-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-ink tabular-nums">
                  {median === 0 ? '<1' : median}
                </span>
                <span className="text-base font-medium text-faint">ms</span>
              </div>
              <p className="mt-1 text-[13px] text-muted">latencia mediana</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
