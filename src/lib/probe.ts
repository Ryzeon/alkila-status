import 'server-only';

import type { Signal } from './types';

/**
 * 8 s deja margen bajo el límite de 10 s de las funciones serverless en el
 * plan Hobby de Vercel. Todos los chequeos corren en paralelo, así que el peor
 * caso total es ~8 s, no la suma.
 */
const TIMEOUT_MS = 8_000;

/** Sobre este umbral el componente se marca degradado aunque responda 200. */
const SLOW_MS = 3_000;

const USER_AGENT = 'alkila-status/1.0';

export interface HttpProbeOptions {
  url: string;
  expectJsonStatus?: string;
}

/**
 * Sondea una URL desde fuera de la infraestructura vigilada.
 *
 * Esta es la señal que importa: mide lo que un usuario real experimenta,
 * incluyendo DNS, TLS y el proxy — cosas que un healthcheck interno no ve.
 */
export async function probeHttp({ url, expectJsonStatus }: HttpProbeOptions): Promise<Signal> {
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });

    const latencyMs = Date.now() - startedAt;

    if (response.status >= 500) {
      return { label: 'HTTP', health: 'down', detail: `Error del servidor (${response.status})`, latencyMs };
    }

    if (response.status >= 400) {
      return {
        label: 'HTTP',
        health: 'degraded',
        detail: `Respuesta inesperada (${response.status})`,
        latencyMs,
      };
    }

    // El actuator de Spring responde 200 con {"status":"UP"}. Si algún health
    // indicator interno falla, el agregado deja de ser UP.
    if (expectJsonStatus) {
      let reported: string | undefined;

      try {
        const body = (await response.json()) as { status?: string };
        reported = body?.status;
      } catch {
        return {
          label: 'HTTP',
          health: 'degraded',
          detail: 'Respuesta con formato inesperado',
          latencyMs,
        };
      }

      if (reported !== expectJsonStatus) {
        return {
          label: 'HTTP',
          health: 'down',
          detail: 'El servicio reporta un problema interno',
          latencyMs,
        };
      }

      return {
        label: 'HTTP',
        health: latencyMs > SLOW_MS ? 'degraded' : 'operational',
        detail: latencyMs > SLOW_MS ? 'Respuesta lenta' : 'Disponible',
        latencyMs,
      };
    }

    return {
      label: 'HTTP',
      health: latencyMs > SLOW_MS ? 'degraded' : 'operational',
      detail: latencyMs > SLOW_MS ? 'Respuesta lenta' : 'Disponible',
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const isTimeout = error instanceof Error && error.name === 'TimeoutError';

    return {
      label: 'HTTP',
      health: 'down',
      detail: isTimeout ? 'Sin respuesta' : 'No se pudo conectar',
      latencyMs,
    };
  }
}

export interface DependencyReport {
  status?: string;
  latencyMs?: number;
}

/**
 * Lee el endpoint de dependencias de la API, que reporta la salud de los
 * servicios que viven en red privada (Mongo, Redis).
 *
 * Devuelve null si no hay endpoint configurado o si no respondió: en ese caso
 * los componentes que dependen de él quedan explícitamente "sin datos", que es
 * información honesta — no un falso verde.
 */
export async function fetchDependencies(
  url: string,
): Promise<Record<string, DependencyReport> | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const body = (await response.json()) as unknown;
    if (!body || typeof body !== 'object') return null;

    return body as Record<string, DependencyReport>;
  } catch {
    return null;
  }
}
