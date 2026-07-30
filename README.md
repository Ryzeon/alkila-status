This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Space Grotesk.

## Arquitectura

```
Vercel (este repo)
  ├── probe HTTP ──────────► alkila.com.pe
  │                          app.alkila.com.pe
  │                          developers.alkila.com.pe
  │                          api.alkila.com.pe/actuator/health
  │
  └── GET ALKILA_DEPS_URL ─► alkila-status-agent ──► MongoDB
                             (red privada)       └─► Redis
```

Los chequeos salen desde Vercel, fuera de la infraestructura monitoreada. Mongo y
Redis no tienen dominio público; los reporta
[alkila-status-agent](https://github.com/Ryzeon/alkila-status-agent).

| Componente | Método |
|---|---|
| `mongodb` | agente |
| `redis` | agente |
| `api` | HTTP + actuator |
| `app` | HTTP |
| `web` | HTTP |
| `devdocs` | HTTP |

Definidos en `src/lib/services.ts`.

```
src/
├── app/
│   ├── page.tsx              SSR del primer chequeo
│   ├── api/status/route.ts   endpoint de polling
│   └── globals.css           tokens de tema
├── lib/
│   ├── services.ts           definición de componentes
│   ├── probe.ts              probes HTTP y lectura del agente
│   ├── collect.ts            orquestación en paralelo
│   └── types.ts              Health, Signal, StatusReport
└── components/
```

### API

```
GET /api/status
```

```json
{
  "overall": "operational",
  "services": [
    {
      "id": "api",
      "name": "API",
      "kind": "backend",
      "health": "operational",
      "latencyMs": 296,
      "detail": "actuator UP"
    }
  ],
  "generatedAt": "2026-07-30T01:27:13.534Z",
  "durationMs": 299
}
```

`health`: `operational` | `degraded` | `down` | `unknown`.

### Variables de entorno

| Variable | Requerida | Default |
|---|---|---|
| `ALKILA_DEPS_URL` | no | — |
| `NEXT_PUBLIC_REFRESH_SECONDS` | no | `30` |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
