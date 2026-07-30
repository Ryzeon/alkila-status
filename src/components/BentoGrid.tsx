'use client';

import { formatLatency, type HistoryPoint, type ServiceStatus } from '@/lib/types';
import { healthColor, healthLabel } from './StatusDot';
import { UptimeStrip } from './UptimeStrip';

function Card({ service, history }: { service: ServiceStatus; history: HistoryPoint[] }) {
  const color = healthColor(service.health);

  return (
    <article
      className="group relative flex flex-col gap-6 overflow-hidden rounded-lg border border-line p-6 transition-colors duration-500 hover:border-line-strong"
      style={{ background: 'var(--glass)' }}
    >
      {/* Lavado que crece al hover, teñido por el estado del servicio. */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: `color-mix(in srgb, ${color} 30%, transparent)` }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight text-ink">{service.name}</h3>
          <p className="mt-1 text-[13px] leading-snug text-muted">{service.description}</p>
        </div>

        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: color }}
          aria-hidden="true"
        />
      </div>

      <div className="relative mt-auto">
        <UptimeStrip history={history} />

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-semibold" style={{ color }}>
            {healthLabel(service.health)}
          </span>

          {service.latencyMs !== undefined && (
            <span className="text-[13px] text-faint tabular-nums">
              {formatLatency(service.latencyMs)}
            </span>
          )}
        </div>

        {/* El motivo solo aparece cuando hay algo que explicar. */}
        {service.health !== 'operational' && (
          <p className="mt-1.5 text-[11px] text-faint">{service.detail}</p>
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
    <section id="servicios" className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 md:py-32">
      <h2
        className="mb-12 leading-[1] font-bold tracking-[-0.03em] text-ink"
        style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
      >
        Estado por servicio
      </h2>

      {/* Seis tarjetas iguales en 3 columnas: dos filas exactas, sin huecos. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} service={service} history={history[service.id] ?? []} />
        ))}
      </div>
    </section>
  );
}
