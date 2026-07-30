/**
 * Salud de un componente, de mejor a peor. El orden importa: `worstOf` lo usa
 * para combinar señales.
 */
export type Health = 'operational' | 'degraded' | 'down' | 'unknown';

const SEVERITY: Record<Health, number> = {
  operational: 0,
  unknown: 1,
  degraded: 2,
  down: 3,
};

export function worstOf(healths: Health[]): Health {
  if (healths.length === 0) return 'unknown';
  return healths.reduce((a, b) => (SEVERITY[b] > SEVERITY[a] ? b : a));
}

export type ServiceKind = 'database' | 'cache' | 'backend' | 'frontend';

/** Una lectura individual. */
export interface Signal {
  /** Etiqueta corta para la UI, p. ej. "HTTP" o "vía API". */
  label: string;
  health: Health;
  /** Texto legible: "200", "actuator UP", "sin respuesta en 8 s". */
  detail: string;
  latencyMs?: number;
}

export interface ServiceStatus {
  id: string;
  name: string;
  kind: ServiceKind;
  description: string;
  /** URL pública, si el componente la tiene. */
  href?: string;
  health: Health;
  latencyMs?: number;
  /** Motivo legible del estado actual, mostrado bajo el nombre. */
  detail: string;
}

export interface StatusReport {
  overall: Health;
  services: ServiceStatus[];
  generatedAt: string;
  durationMs: number;
}

/** Una medición pasada, acumulada en el navegador mientras la página vive. */
export interface HistoryPoint {
  at: number;
  health: Health;
}

/**
 * Un ping sub-milisegundo se trunca a 0 y en pantalla parece dato faltante
 * cuando en realidad es la mejor lectura posible.
 */
export function formatLatency(ms: number): string {
  return ms === 0 ? '<1 ms' : `${ms} ms`;
}
