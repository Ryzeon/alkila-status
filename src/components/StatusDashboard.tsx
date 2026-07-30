'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { HistoryPoint, StatusReport } from '@/lib/types';
import { BentoGrid } from './BentoGrid';
import { GlassNav } from './GlassNav';
import { Hero } from './Hero';
import { SiteFooter } from './SiteFooter';
import { StatusMarquee } from './StatusMarquee';

const REFRESH_SECONDS = Number(process.env.NEXT_PUBLIC_REFRESH_SECONDS ?? 30);
const MAX_HISTORY = 60;

type History = Record<string, HistoryPoint[]>;

function appendHistory(previous: History, report: StatusReport): History {
  const at = new Date(report.generatedAt).getTime();
  const next: History = { ...previous };

  for (const service of report.services) {
    const points = next[service.id] ?? [];

    // El polling puede devolver la misma lectura si el servidor no rehizo el
    // chequeo; no se duplica un punto con idéntico timestamp.
    if (points.at(-1)?.at === at) continue;

    next[service.id] = [...points, { at, health: service.health }].slice(-MAX_HISTORY);
  }

  return next;
}

export function StatusDashboard({ initial }: { initial: StatusReport }) {
  const [report, setReport] = useState(initial);
  // Arranca vacío: el historial es data acumulada en el navegador, y las horas
  // de las barras se formatean con el locale del cliente. Sembrarlo durante el
  // SSR provocaría un mismatch de hidratación.
  const [history, setHistory] = useState<History>({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  // Se evita recrear el intervalo de refresco en cada render.
  const reportRef = useRef(report);
  reportRef.current = report;

  const refresh = useCallback(async () => {
    setRefreshing(true);

    try {
      const response = await fetch('/api/status', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const next = (await response.json()) as StatusReport;

      setReport(next);
      setHistory((previous) => appendHistory(previous, next));
      setError(null);
    } catch {
      // Si el propio status page falla, se dice — no se muestra data vieja
      // como si fuera fresca.
      setError('No se pudo actualizar');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Primera barra: la lectura que vino renderizada del servidor.
  useEffect(() => {
    setHistory((previous) => appendHistory(previous, initial));
  }, [initial]);

  useEffect(() => {
    const id = setInterval(refresh, REFRESH_SECONDS * 1_000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    function tick() {
      const since = new Date(reportRef.current.generatedAt).getTime();
      setElapsed(Math.max(0, Math.round((Date.now() - since) / 1000)));
    }

    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  const updatedLabel =
    elapsed === null
      ? 'Actualizando'
      : elapsed < 60
        ? 'Actualizado hace un momento'
        : `Actualizado hace ${Math.floor(elapsed / 60)} min`;

  const measuredCount = report.services.filter((service) => service.health !== 'unknown').length;

  return (
    <main className="w-full max-w-full overflow-x-clip">
      <div className="ambient" aria-hidden="true" />

      <GlassNav onRefresh={refresh} refreshing={refreshing} />

      <Hero
        overall={report.overall}
        services={report.services}
        updatedLabel={updatedLabel}
        measuredCount={measuredCount}
      />

      <StatusMarquee services={report.services} />

      {error && (
        <div className="mx-auto w-full max-w-7xl px-6 pt-10 sm:px-10">
          <p
            className="rounded-md border px-5 py-4 text-[14px]"
            style={{
              borderColor: 'color-mix(in srgb, var(--down) 45%, transparent)',
              color: 'var(--down)',
              background: 'color-mix(in srgb, var(--down) 7%, var(--surface))',
            }}
          >
            {error}. Se muestra la última lectura conocida.
          </p>
        </div>
      )}

      <BentoGrid services={report.services} history={history} />

      <SiteFooter refreshSeconds={REFRESH_SECONDS} updatedLabel={updatedLabel} />
    </main>
  );
}
