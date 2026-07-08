import { Button } from '@pranakaia/ui';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-24 text-center">
      <h2 className="text-2xl font-bold mb-4">404 - Página no encontrada</h2>
      <p className="mb-6 text-gray-600">No pudimos encontrar lo que buscabas.</p>
      <Link href="/admin">
        <Button>Volver al Dashboard</Button>
      </Link>
    </div>
  );
}
