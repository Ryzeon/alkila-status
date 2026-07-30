'use client';

import type { HistoryPoint, ServiceStatus } from '@/lib/types';
import { healthColor, healthLabel } from './StatusDot';
import { UptimeStrip } from './UptimeStrip';

/**
 * Mapa de spans sobre una grilla de 4 columnas. Con `grid-flow-dense`, el orden
 * del DOM (mongodb, redis, api, app, web, devdocs) empaqueta así:
 *
 *   fila 1:  mongo  mongo  redis  app        = 4
 *   fila 2:  api    api    web    web        = 4
 *   fila 3:  api    api    docs   docs       = 4
 *
 * 12 celdas, 12 ocupadas. `app` hace backfill del hueco de la fila 1 gracias a
 * dense, porque `api` (2 de ancho) no cabía en la única columna que quedaba.
 */
const SPAN: Record<string, string> = {
  mongodb: 'md:col-span-2',
  redis: 'md:col-span-1',
  api: 'md:col-span-2 md:row-span-2',
  app: 'md:col-span-1',
  web: 'md:col-span-2',
  devdocs: 'md:col-span-2',
};

function Card({
  service,
  history,
  feature,
}: {
  service: ServiceStatus;
  history: HistoryPoint[];
  feature: boolean;
}) {
  const color = healthColor(service.health);

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-lg border border-line p-6 transition-colors duration-500 hover:border-line-strong ${
        feature ? 'gap-8 sm:p-8' : 'gap-6'
      } ${SPAN[service.id] ?? ''}`}
      style={{ background: 'var(--glass)' }}
    >
      {/* Lavado que crece al hover, teñido por el estado del componente. */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: `color-mix(in srgb, ${color} 30%, transparent)` }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className={`font-semibold tracking-tight text-ink ${feature ? 'text-3xl' : 'text-lg'}`}
          >
            {service.name}
          </h3>
          <p className="mt-1 text-[13px] leading-snug text-muted">{service.description}</p>
        </div>

        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: color }}
          aria-hidden="true"
        />
      </div>

      <div className="relative">
        {feature && service.latencyMs !== undefined && (
          <div className="mb-7 flex items-baseline gap-1.5">
            <span className="text-5xl font-bold tracking-tighter text-ink tabular-nums">
              {service.latencyMs}
            </span>
            <span className="text-lg font-medium text-faint">ms</span>
          </div>
        )}

        <UptimeStrip history={history} />

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-semibold" style={{ color }}>
            {healthLabel(service.health)}
          </span>

          {!feature && service.latencyMs !== undefined && (
            <span className="text-[13px] text-faint tabular-nums">{service.latencyMs} ms</span>
          )}
        </div>

        <p className="mt-1.5 text-[11px] text-faint">{service.detail}</p>

        {service.href && (
          <a
            href={service.href}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-[11px] text-faint transition-colors hover:text-brand"
          >
            {service.href.replace(/^https?:\/\//, '')} &#8599;
          </a>
        )}
      </div>
    </article>
  );
}

export function BentoGrid({
  services,
  history,
}: {
  services: ServiceStatus[];
  history: Record<string, HistoryPoint[]>;
}) {
  return (
    <section id="componentes" className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 md:py-36">
      <h2
        className="mb-14 max-w-[18ch] leading-[1] font-bold tracking-[-0.03em] text-ink"
        style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}
      >
        Seis piezas, medidas una por una
      </h2>

      <div className="grid auto-rows-[minmax(190px,auto)] grid-flow-dense grid-cols-1 gap-4 md:grid-cols-4">
        {services.map((service) => (
          <Card
            key={service.id}
            service={service}
            history={history[service.id] ?? []}
            feature={service.id === 'api'}
          />
        ))}
      </div>
    </section>
  );
}
