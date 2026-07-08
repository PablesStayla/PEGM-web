import { Button, Card, CardContent } from '@pranakaia/ui';
import { ArrowLeft, HelpCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Cancel Header */}
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Pago Cancelado</h1>
        <p className="mt-2 text-lg text-gray-600">
          No se realizó ningún cargo. Tu carrito sigue disponible.
        </p>
      </div>

      {/* Info Card */}
      <Card className="mt-10">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold">¿Qué pasó?</h2>
          <p className="mt-2 text-gray-600">
            Cancelaste el proceso de pago. No te preocupes, no se realizó ningún cargo y tus
            productos siguen en el carrito.
          </p>

          <div className="mt-6 space-y-3">
            <h3 className="font-medium">Puedes:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Volver al carrito y reintentar el pago</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Modificar los productos en tu carrito</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Continuar navegando y comprar más tarde</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium">¿Tuviste algún problema?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Si experimentaste algún error durante el pago, estos son los problemas más comunes:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>• Tarjeta declinada o fondos insuficientes</li>
                <li>• Datos de la tarjeta incorrectos</li>
                <li>• Problemas de conexión a internet</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Carrito
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/products">Seguir Comprando</Link>
        </Button>
      </div>

      {/* Help */}
      <div className="mt-10 text-center text-sm text-gray-500">
        <p>¿Necesitas ayuda?</p>
        <a href="mailto:soporte@pranakaia.com" className="mt-1 text-green-600 hover:text-green-700">
          Contáctanos en soporte@pranakaia.com
        </a>
      </div>
    </div>
  );
}
