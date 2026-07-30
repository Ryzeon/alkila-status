'use client';

import type { ServiceStatus } from '@/lib/types';
import { healthColor, healthLabel } from './StatusDot';

/**
 * Marquee infinito con los componentes reales y su estado actual.
 * La pista se duplica para que el bucle no tenga costura.
 */
export function StatusMarquee({ services }: { services: ServiceStatus[] }) {
  if (services.length === 0) return null;

  const loop = [...services, ...services];

  return (
    <div
      className="marquee-mask overflow-hidden border-y border-line py-6"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max items-center gap-12 pr-12">
        {loop.map((service, index) => (
          <span key={`${service.id}-${index}`} className="flex shrink-0 items-center gap-3">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: healthColor(service.health) }}
            />
            <span
              className="text-2xl font-semibold tracking-tight whitespace-nowrap text-ink sm:text-3xl"
            >
              {service.name}
            </span>
            <span className="text-[13px] whitespace-nowrap text-faint">
              {healthLabel(service.health)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
