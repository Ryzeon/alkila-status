'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { ServiceStatus } from '@/lib/types';
import { healthColor } from './StatusDot';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCRUB_TEXT =
  'Cada medición sale de un servidor de Vercel, viaja hasta Lima, atraviesa DNS, el handshake TLS y el proxy, y vuelve. Lo que ves abajo es ese viaje completo, no un ping interno que se miente a sí mismo.';

/** Peor latencia esperable antes de considerar la barra llena. */
const SCALE_MAX_MS = 1_200;

export function LatencySection({ services }: { services: ServiceStatus[] }) {
  const root = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Respeta la preferencia del sistema: sin movimiento, todo queda visible.
      const mm = gsap.matchMedia();

      mm.add(
        {
          motionOk: '(prefers-reduced-motion: no-preference)',
          isDesktop: '(min-width: 768px)',
        },
        (context) => {
          const { motionOk, isDesktop } = context.conditions as {
            motionOk: boolean;
            isDesktop: boolean;
          };

          if (!motionOk) return;

          // Scrubbing text reveal: las palabras se encienden en secuencia.
          gsap.fromTo(
            '[data-scrub-word]',
            { opacity: 0.12 },
            {
              opacity: 1,
              stagger: 0.35,
              ease: 'none',
              scrollTrigger: {
                trigger: '[data-scrub]',
                start: 'top 78%',
                end: 'bottom 55%',
                scrub: 0.6,
              },
            },
          );

          // Pin split: el titular se queda quieto mientras las filas suben.
          if (isDesktop && pinned.current && rows.current) {
            ScrollTrigger.create({
              trigger: rows.current,
              start: 'top 22%',
              end: 'bottom 80%',
              pin: pinned.current,
              pinSpacing: false,
            });
          }

          // Cada fila entra desde abajo y su barra crece hasta su ancho real.
          gsap.utils.toArray<HTMLElement>('[data-row]').forEach((row) => {
            gsap.from(row, {
              y: 44,
              opacity: 0,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: { trigger: row, start: 'top 88%' },
            });

            const bar = row.querySelector('[data-bar]');
            if (!bar) return;

            gsap.from(bar, {
              scaleX: 0,
              transformOrigin: 'left center',
              duration: 1.1,
              ease: 'power3.out',
              scrollTrigger: { trigger: row, start: 'top 88%' },
            });
          });
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  const measured = services.filter((service) => service.latencyMs !== undefined);

  return (
    <section
      id="latencia"
      ref={root}
      className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 md:py-40"
    >
      <p
        data-scrub
        className="mx-auto mb-28 max-w-4xl text-center leading-[1.45] font-medium tracking-tight text-ink"
        style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2.4rem)' }}
      >
        {SCRUB_TEXT.split(' ').map((word, index) => (
          <span key={`${word}-${index}`} data-scrub-word className="inline-block">
            {word}&nbsp;
          </span>
        ))}
      </p>

      <div className="grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
        <div ref={pinned} className="md:self-start">
          <h2
            className="max-w-[12ch] leading-[0.98] font-bold tracking-[-0.03em] text-ink"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}
          >
            El viaje
            <span
              className="mx-3 inline-block h-[0.8em] w-[2.1em] translate-y-[0.04em] rounded-full bg-cover bg-center align-middle contrast-110 saturate-50 ring-1 ring-line"
              style={{
                backgroundImage: "url('https://picsum.photos/seed/dawnhighway/640/280')",
              }}
              aria-hidden="true"
            />
            completo, ida y vuelta
          </h2>

          <p className="mt-7 max-w-sm text-[15px] leading-relaxed text-muted">
            Barras proporcionales al peor caso esperable ({SCALE_MAX_MS} ms). Los componentes
            sin dominio propio no aparecen: no se puede cronometrar lo que no se puede
            alcanzar.
          </p>
        </div>

        <div ref={rows} className="flex flex-col">
          {measured.map((service) => {
            const color = healthColor(service.health);
            const ratio = Math.min(1, (service.latencyMs ?? 0) / SCALE_MAX_MS);

            return (
              <div
                key={service.id}
                data-row
                className="group border-b border-line py-7 first:pt-0"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-xl font-semibold tracking-tight text-ink">
                    {service.name}
                  </span>
                  <span className="text-xl font-bold tracking-tight tabular-nums" style={{ color }}>
                    {service.latencyMs === 0 ? '<1' : service.latencyMs}
                    <span className="ml-1 text-sm font-medium text-faint">ms</span>
                  </span>
                </div>

                <div
                  className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: 'var(--track)' }}
                >
                  <div
                    data-bar
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(4, ratio * 100)}%`, background: color }}
                  />
                </div>

                <p className="mt-3 text-[12px] text-faint">{service.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
