import type { ServiceKind } from './types';

/**
 * Cómo se verifica un componente.
 *
 * - `http`   → se sondea su dominio público desde fuera de la infraestructura.
 * - `dependency` → no tiene dominio propio (Mongo, Redis viven en red privada).
 *   Su salud la reporta el agente que vive junto a ellas. Mientras ese agente
 *   no esté configurado, el componente se muestra como "sin datos" — nunca se
 *   asume que está bien.
 */
export type CheckStrategy =
  | {
      kind: 'http';
      url: string;
      /** URL mostrada al usuario, si difiere de la sondeada. */
      href?: string;
      /** Exige que el JSON traiga `status` con este valor (actuator de Spring). */
      expectJsonStatus?: string;
    }
  | {
      kind: 'dependency';
      /** Clave dentro del payload del endpoint de dependencias. */
      key: string;
    };

export interface ServiceDefinition {
  id: string;
  name: string;
  kind: ServiceKind;
  description: string;
  check: CheckStrategy;
}

/**
 * Los seis componentes del stack Alkila.
 *
 * Todo se mide por HTTP público desde Vercel: el status page no depende de
 * ninguna credencial ni de ningún panel de control que pueda caerse junto con
 * lo que vigila.
 */
export const SERVICES: ServiceDefinition[] = [
  {
    id: 'mongodb',
    name: 'MongoDB',
    kind: 'database',
    description: 'Replica set rs0 · base de datos principal',
    check: { kind: 'dependency', key: 'mongodb' },
  },
  {
    id: 'redis',
    name: 'Redis',
    kind: 'cache',
    description: 'Caché y sesiones',
    check: { kind: 'dependency', key: 'redis' },
  },
  {
    id: 'api',
    name: 'API',
    kind: 'backend',
    description: 'Backend Spring Boot',
    check: {
      kind: 'http',
      url: 'https://api.alkila.com.pe/actuator/health',
      href: 'https://api.alkila.com.pe',
      expectJsonStatus: 'UP',
    },
  },
  {
    id: 'app',
    name: 'App',
    kind: 'frontend',
    description: 'SaaS de gestión hotelera',
    check: { kind: 'http', url: 'https://app.alkila.com.pe' },
  },
  {
    id: 'web',
    name: 'Web',
    kind: 'frontend',
    description: 'Sitio público',
    check: { kind: 'http', url: 'https://alkila.com.pe' },
  },
  {
    id: 'devdocs',
    name: 'Dev Docs',
    kind: 'frontend',
    description: 'Documentación para desarrolladores',
    check: { kind: 'http', url: 'https://developers.alkila.com.pe' },
  },
];

/**
 * Endpoint del agente `alkila-status-agent`, que vive junto a Mongo y Redis y
 * los pinguea desde dentro de la red privada. Contrato (ver su README):
 *   { "mongodb": { "status": "UP", "latencyMs": 12 }, "redis": { ... } }
 *
 * Es independiente del backend Spring a propósito: si ese proceso muere, el
 * agente sigue en pie y puede decir que las bases están sanas.
 * Si no está configurado, Mongo y Redis se muestran como "sin datos".
 */
export function dependenciesUrl(): string | undefined {
  return process.env.ALKILA_DEPS_URL || undefined;
}
