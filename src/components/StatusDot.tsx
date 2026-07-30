import type { Health } from '@/lib/types';

const TONE: Record<Health, { color: string; label: string }> = {
  operational: { color: 'var(--ok)', label: 'Operativo' },
  degraded: { color: 'var(--degraded)', label: 'Degradado' },
  down: { color: 'var(--down)', label: 'Caído' },
  unknown: { color: 'var(--idle)', label: 'Sin datos' },
};

export function healthLabel(health: Health): string {
  return TONE[health].label;
}

export function healthColor(health: Health): string {
  return TONE[health].color;
}

export function StatusDot({ health, size = 8 }: { health: Health; size?: number }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${health === 'operational' ? 'status-pulse' : ''}`}
      style={{ width: size, height: size, background: TONE[health].color }}
      aria-hidden="true"
    />
  );
}
