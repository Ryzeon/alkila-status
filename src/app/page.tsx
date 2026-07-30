import { StatusDashboard } from '@/components/StatusDashboard';
import { collectStatus } from '@/lib/collect';

// Cada visita hace un chequeo real; sin caché de por medio.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  // Se llama la función directamente en vez de hacer fetch a /api/status:
  // evita un salto de red y renderiza el estado real ya en el HTML inicial.
  const report = await collectStatus();

  return <StatusDashboard initial={report} />;
}
