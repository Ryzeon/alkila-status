'use client';

import type { HistoryPoint } from '@/lib/types';
import { healthColor } from './StatusDot';

const SLOTS = 44;

/**
 * Barras de los últimos chequeos.
 *
 * Deliberadamente NO simula un historial de 90 días: solo dibuja mediciones
 * reales tomadas mientras la página está abierta. Las ranuras aún no medidas
 * se pintan como pista vacía. Un historial persistente requiere un almacén
 * (ver README).
 */
export function UptimeStrip({ history }: { history: HistoryPoint[] }) {
  const recent = history.slice(-SLOTS);
  const empty = Math.max(0, SLOTS - recent.length);

  return (
    <div
      className="flex h-[26px] items-stretch gap-[3px]"
      role="img"
      aria-label={
        recent.length === 0
          ? 'Sin chequeos aún en esta sesión'
          : `Últimos ${recent.length} chequeos de esta sesión`
      }
    >
      {Array.from({ length: empty }).map((_, index) => (
        <span
          key={`empty-${index}`}
          className="min-w-[3px] flex-1 rounded-[2px]"
          style={{ background: 'var(--track)' }}
        />
      ))}

      {recent.map((point) => (
        <span
          key={point.at}
          className="min-w-[3px] flex-1 rounded-[2px]"
          style={{ background: healthColor(point.health) }}
          // Hora local del navegador. Se formatea en cliente a propósito: el
          // formato de locale difiere entre Node y el navegador y rompería la
          // hidratación si se renderizara en el servidor.
          title={new Date(point.at).toLocaleTimeString('es-PE')}
        />
      ))}
    </div>
  );
}
