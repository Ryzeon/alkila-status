'use client';

import type { Health } from '@/lib/types';
import { healthColor, healthLabel } from './StatusDot';

const LEGEND: Health[] = ['operational', 'degraded', 'down', 'unknown'];

export function SiteFooter({
  refreshSeconds,
  updatedLabel,
}: {
  refreshSeconds: number;
  updatedLabel: string;
}) {
  return (
    <footer className="mx-auto w-full max-w-7xl px-6 pt-10 pb-16 sm:px-10">
      <div className="flex flex-col gap-5 border-t border-line pt-8 text-[12px] text-faint md:flex-row md:items-center md:justify-between">
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
          {updatedLabel} · se actualiza cada {refreshSeconds} segundos
        </span>
      </div>
    </footer>
  );
}
