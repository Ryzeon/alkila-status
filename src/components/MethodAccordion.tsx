'use client';

interface Slice {
  id: string;
  title: string;
  body: string;
  seed: string;
}

/**
 * Acordeón horizontal: cuatro rebanadas que se expanden al hover.
 * El contenido es el método real de medición, no relleno.
 */
const SLICES: Slice[] = [
  {
    id: 'probe',
    title: 'Probe HTTP externo',
    body: 'Un GET real a cada dominio desde Vercel. Mide DNS, handshake TLS y el paso por el proxy — la ruta exacta de un usuario, no un ping interno.',
    seed: 'networkcables',
  },
  {
    id: 'actuator',
    title: 'Actuator de Spring',
    body: 'La API no basta con responder 200: se exige que el cuerpo traiga status UP. Si un health indicator interno falla, el agregado deja de serlo y aquí se ve.',
    seed: 'serverrack',
  },
  {
    id: 'deps',
    title: 'Dependencias privadas',
    body: 'MongoDB y Redis viven en red privada, sin dominio propio. Su salud tendrá que reportarla la API. Hasta entonces se muestran sin datos, nunca en verde.',
    seed: 'datacenterdark',
  },
  {
    id: 'independent',
    title: 'Cero panel de control',
    body: 'Sin tokens, sin API de orquestación. Nada que se caiga junto con lo que vigila. Si el servidor se apaga entero, esta página sigue midiendo y lo dice.',
    seed: 'lighthousefog',
  },
];

export function MethodAccordion() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 md:py-36">
      <h2
        className="mb-14 max-w-[20ch] leading-[1] font-bold tracking-[-0.03em] text-ink"
        style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}
      >
        Cómo se mide cada cosa
      </h2>

      <div className="flex flex-col gap-3 md:h-[26rem] md:flex-row">
        {SLICES.map((slice) => (
          <article
            key={slice.id}
            className="group relative flex-1 overflow-hidden rounded-lg border border-line transition-all duration-700 ease-out md:hover:flex-[3.2]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center grayscale transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: `url('https://picsum.photos/seed/${slice.seed}/1200/900')`,
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 transition-opacity duration-700"
              // Se concentra el lavado abajo, donde vive el texto, para que la
              // imagen conserve presencia arriba en ambos temas.
              style={{
                background:
                  'linear-gradient(to top, var(--bg) 2%, color-mix(in srgb, var(--bg) 88%, transparent) 34%, transparent 78%)',
              }}
              aria-hidden="true"
            />

            <div className="relative flex h-full flex-col justify-end p-6 md:p-7">
              <h3 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
                {slice.title}
              </h3>

              <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted opacity-100 transition-opacity duration-500 md:max-h-0 md:overflow-hidden md:opacity-0 md:group-hover:max-h-40 md:group-hover:opacity-100">
                {slice.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
