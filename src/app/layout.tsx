import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';

import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Estado de Alkila',
  description: 'Estado en tiempo real de la infraestructura de Alkila.',
  robots: { index: true, follow: true },
};

/**
 * Aplica el tema guardado antes del primer paint para evitar el flash de
 * tema equivocado. Va inline y síncrono a propósito.
 */
const THEME_BOOTSTRAP = `
(function () {
  try {
    var saved = localStorage.getItem('alkila-status-theme');
    var theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className={`${spaceGrotesk.variable} font-display antialiased`}>{children}</body>
    </html>
  );
}
