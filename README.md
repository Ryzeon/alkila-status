# alkila-status

Status page de la infraestructura de Alkila. Next.js 16 + Tailwind v4, pensado para
desplegarse en **Vercel** — fuera de la infraestructura que vigila.

## Por qué vive fuera

Un status page alojado en el mismo servidor que monitorea se cae junto con lo que
debe reportar, justo cuando más se necesita. Este proyecto:

- Corre en Vercel, infraestructura independiente.
- No usa credenciales de ningún panel de control.
- Mide por HTTP público, desde fuera, atravesando DNS, TLS y el proxy — la misma
  ruta que recorre un usuario real.

Si el servidor de Alkila se apaga entero, este chequeo sigue corriendo y lo reporta.

## Componentes vigilados

| Componente | Cómo se mide | Endpoint |
|---|---|---|
| MongoDB | vía agente (red privada) | `alkila-status-agent` |
| Redis | vía agente (red privada) | `alkila-status-agent` |
| API | probe HTTP + actuator | `api.alkila.com.pe/actuator/health` |
| App | probe HTTP | `app.alkila.com.pe` |
| Web | probe HTTP | `alkila.com.pe` |
| Dev Docs | probe HTTP | `developers.alkila.com.pe` |

Se editan en `src/lib/services.ts`.

## MongoDB y Redis: vía agente

Ambos viven en red privada y **no tienen dominio propio**, así que no se pueden
sondear desde fuera. Los reporta [`alkila-status-agent`](../alkila-status-agent),
un servicio en Go que vive junto a ellos y los pinguea desde dentro.

Es un proceso **independiente del backend Spring** a propósito. Un endpoint en la
API habría quedado ciego justo cuando la app se cae — que es el fallo más común y
el momento en que más importa saber si las bases están sanas o si el problema es
la app.

Sin `ALKILA_DEPS_URL` configurada, ambos se muestran **«sin datos»** — nunca como
operativos, porque asumir salud sin medirla es peor que admitir que no se sabe.
En ese caso el hero avisa explícitamente cuántos componentes quedaron sin medir.

### Contrato

```json
{
  "mongodb":   { "status": "UP", "latencyMs": 12 },
  "redis":     { "status": "UP", "latencyMs": 3 },
  "checkedAt": "2026-07-30T01:03:06Z",
  "cached":    false
}
```

`status` acepta `UP`, `DEGRADED` o cualquier otro valor (se interpreta como
caído). Ver el README del agente para el resto.

## Historial

Las barras muestran **solo chequeos reales tomadas mientras la pestaña está abierta**.
No hay historial de 90 días fabricado: Vercel es stateless y sin un almacén no existe
esa data.

Para historial persistente hace falta un store (Vercel KV / Upstash Redis) y un Vercel
Cron que escriba una medición cada N minutos. `HistoryPoint` en `src/lib/types.ts` ya
tiene la forma que ese store necesitaría.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # opcional: solo si ya existe el endpoint de dependencias
npm run dev
```

`npm run build && npm start` para probar el build de producción.

## Despliegue en Vercel

```bash
npx vercel            # preview
npx vercel --prod     # producción
```

Variables de entorno (Project Settings → Environment Variables):

| Variable | Requerida | Notas |
|---|---|---|
| `ALKILA_DEPS_URL` | no | Sin ella, Mongo y Redis salen «sin datos» |
| `NEXT_PUBLIC_REFRESH_SECONDS` | no | Default 30 |

**No hay secretos**: el proyecto no necesita ningún token para funcionar.

### Presupuesto de tiempo

Los chequeos corren todos en paralelo con timeout de 8 s cada uno, así que el peor
caso total es ~8 s — por debajo del límite de 10 s de las funciones serverless en el
plan Hobby. En condiciones normales el chequeo completo tarda ~200 ms.

Si se agregan componentes, mantener el paralelismo: encadenarlos en serie rompería
ese presupuesto.

## Paleta

Tomada literalmente de `alkila-movil-react/src/core/theme/tokens.ts` (que a su vez
viene del mockup «Panel Alkila.dc.html»). Definida en `src/app/globals.css` como
custom properties, con dark y light.

Los colores de estado remapean `status.*` de los tokens:

| Estado | token original | dark | light |
|---|---|---|---|
| Operativo | `status.available` | `#46a877` | `#2f8a5c` |
| Degradado | `status.nearExpiry` | `#e0a13a` | `#b9791a` |
| Caído | `status.expired` | `#d85a4c` | `#c0392b` |
| Sin datos | `status.blocked` | `#9b8b7d` | `#7d6f62` |

No inventar colores fuera de esa paleta.

## Estructura

```
src/
├─ app/
│  ├─ page.tsx              SSR del primer chequeo
│  ├─ api/status/route.ts   endpoint que el cliente sondea cada 30 s
│  └─ globals.css           paleta, fondo ambiental y keyframes
├─ lib/
│  ├─ services.ts           qué se vigila y cómo
│  ├─ probe.ts              probes HTTP + lectura de dependencias
│  ├─ collect.ts            orquestación en paralelo
│  └─ types.ts              Health, Signal, StatusReport
└─ components/
   ├─ GlassNav.tsx          píldora flotante con backdrop-blur
   ├─ Hero.tsx              veredicto + lectura en vivo
   ├─ StatusMarquee.tsx     marquee con los componentes reales
   ├─ BentoGrid.tsx         grilla 4-col con grid-flow-dense
   ├─ LatencySection.tsx    GSAP: pin split + scrub de texto
   ├─ MethodAccordion.tsx   acordeón horizontal
   └─ SiteFooter.tsx        CTA + leyenda
```

## Notas de diseño

El veredicto ES el hero: es lo único que alguien viene a leer cuando algo huele
mal. Por eso ocupa la primera pantalla en lugar de una portada decorativa.

- **Bento gapless.** 4 columnas con `grid-flow-dense`. Con el orden del DOM
  (mongodb, redis, api, app, web, devdocs) empaqueta en 3 filas de 4 sin dejar
  ningún hueco: `app` hace backfill de la fila 1 porque `api` (2 de ancho) no
  cabía en la única columna libre. Al cambiar spans, recalcular que sigan sumando.
- **GSAP.** Pin split en la sección de latencia y scrub de opacidad palabra por
  palabra. Todo dentro de `gsap.matchMedia()`: con `prefers-reduced-motion` no se
  registra ninguna animación y el contenido queda visible.
- **`overflow-x-clip`, no `hidden`.** `hidden` crea un contenedor de scroll que
  rompe el pinning de ScrollTrigger. `clip` evita la barra horizontal sin ese
  efecto secundario.
- **Sin contenido inventado.** No hay testimonios ni logos de "partners": no
  existen para un status page y fabricarlos sería mentir. El marquee usa los
  componentes reales con su estado actual.
- **Imágenes** desde `picsum.photos` como `background-image` (evita configurar
  dominios remotos en `next/image`).
