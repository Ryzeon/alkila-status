import { NextResponse } from 'next/server';

import { collectStatus } from '@/lib/collect';

// El token de Coolify y los probes viven en Node, no en Edge.
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
