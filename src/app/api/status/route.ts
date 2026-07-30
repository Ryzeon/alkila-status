import { NextResponse } from 'next/server';

import { collectStatus } from '@/lib/collect';

// Los probes salen desde Node, no desde Edge: se necesita el stack HTTP completo
// para medir DNS y TLS igual que lo haría un cliente real.
export const runtime = 'nodejs';
// Un status page cacheado es un status page que miente.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const report = await collectStatus();

  return NextResponse.json(report, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
    },
  });
}
