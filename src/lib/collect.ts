import 'server-only';

import { fetchDependencies, probeHttp, type DependencyReport } from './probe';
import { dependenciesUrl, SERVICES } from './services';
import { worstOf, type Health, type ServiceStatus, type StatusReport } from './types';

function healthFromDependency(report: DependencyReport | undefined): {
  health: Health;
  detail: string;
} {
  if (!report?.status) {
    return { health: 'unknown', detail: 'Sin verificar' };
  }

  const status = report.status.toUpperCase();

  if (status === 'UP') return { health: 'operational', detail: 'Disponible' };
  if (status === 'DEGRADED') return { health: 'degraded', detail: 'Respuesta lenta' };

  return { health: 'down', detail: 'No responde' };
}

/**
 * Recolecta el estado de los seis componentes.
 *
 * Todo se mide por HTTP desde Vercel, fuera de la infraestructura vigilada: si
 * el servidor de Alkila se cae entero, este chequeo sigue corriendo y lo
 * reporta. Mongo y Redis no tienen dominio propio, así que su salud llega a
 * través del endpoint de dependencias de la API; sin ese endpoint se muestran
 * como "sin datos" en vez de asumirse sanos.
 */
export async function collectStatus(): Promise<StatusReport> {
  const startedAt = Date.now();
  const depsUrl = dependenciesUrl();

  const [dependencies, probes] = await Promise.all([
    depsUrl ? fetchDependencies(depsUrl) : Promise.resolve(null),
    Promise.all(
      SERVICES.map((service) =>
        service.check.kind === 'http'
          ? probeHttp({ url: service.check.url, expectJsonStatus: service.check.expectJsonStatus })
          : Promise.resolve(null),
      ),
    ),
  ]);

  const services: ServiceStatus[] = SERVICES.map((service, position) => {
    const base = {
      id: service.id,
      name: service.name,
      kind: service.kind,
      description: service.description,
    };

    if (service.check.kind === 'http') {
      const signal = probes[position]!;

      return {
        ...base,
        href: service.check.href ?? service.check.url,
        health: signal.health,
        latencyMs: signal.latencyMs,
        detail: signal.detail,
      };
    }

    if (!depsUrl) {
      return {
        ...base,
        health: 'unknown' as const,
        detail: 'Sin verificar',
      };
    }

    if (!dependencies) {
      return { ...base, health: 'unknown' as const, detail: 'No se pudo verificar' };
    }

    const report = dependencies[service.check.key];
    const { health, detail } = healthFromDependency(report);

    return { ...base, health, latencyMs: report?.latencyMs, detail };
  });

  return {
    // Los componentes "sin datos" no deben teñir el estado global de alarma:
    // no saber no es lo mismo que estar caído. Solo cuentan los medidos.
    overall: worstOf(
      services.map((service) => service.health).filter((health) => health !== 'unknown'),
    ),
    services,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
  };
}
