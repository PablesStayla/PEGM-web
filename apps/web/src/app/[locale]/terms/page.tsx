import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Gavel,
  HelpCircle,
  Lock,
  MapPin,
  PackageCheck,
  RotateCcw,
  Scale,
  ShieldAlert,
  Truck,
  Zap,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos del Servicio | PranaKaia Grow',
  description:
    'Términos y condiciones legales de PranaKaia Grow. Información sobre derechos del consumidor, garantías, envíos y cumplimiento de la Ley 19.496 en Chile.',
  keywords: [
    'términos y condiciones Chile',
    'derechos consumidor e-commerce',
    'garantía legal Chile',
    'Ley 19.496',
    'pranakaia grow términos',
  ],
};

export default function TermsPage() {
  const lastUpdated = '6 de marzo de 2026';

  return (
    <main className="min-h-screen bg-zinc-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enterprise Header */}
        <div className="bg-zinc-900 rounded-3xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Gavel size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500/20 p-2 rounded-xl">
                <Scale className="text-amber-400 h-6 w-6" />
              </div>
              <span className="text-sm font-bold tracking-widest uppercase text-amber-400">
                Legal Compliance & Consumer Protection
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
              Términos del Servicio
            </h1>
            <p className="text-gray-400 max-w-2xl mb-6">
              Bienvenido a PranaKaia Grow. Al utilizar nuestra plataforma, aceptas cumplir con estas
              reglas diseñadas para garantizar una experiencia legal, segura y transparente bajo la
              <strong> Ley 19.496 del Consumidor</strong>.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
              <span className="bg-white/10 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Vigente desde: {lastUpdated}
              </span>
              <span className="bg-white/10 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Concepción, Chile
              </span>
            </div>
          </div>
        </div>

        {/* Quick Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <Zap className="mx-auto text-blue-500 mb-2 h-4 w-4" />
            <span className="block text-[10px] font-black uppercase text-zinc-400">Retracto</span>
            <span className="text-xs font-bold">10 Días</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <ShieldAlert className="mx-auto text-red-500 mb-2 h-4 w-4" />
            <span className="block text-[10px] font-black uppercase text-zinc-400">
              Edad Mínima
            </span>
            <span className="text-xs font-bold">18+ Años</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <PackageCheck className="mx-auto text-green-500 mb-2 h-4 w-4" />
            <span className="block text-[10px] font-black uppercase text-zinc-400">Garantía</span>
            <span className="text-xs font-bold">6 Meses</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <Lock className="mx-auto text-zinc-400 mb-2 h-4 w-4" />
            <span className="block text-[10px] font-black uppercase text-zinc-400">
              Jurisdicción
            </span>
            <span className="text-xs font-bold">Concepción</span>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-6 text-zinc-600">
          <section className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> 1. Aceptación y Registro
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                Este documento regula el uso de los servicios de <strong>Pranalab SPA</strong>. Al
                registrarte o realizar una compra, declaras ser mayor de edad y contar con la
                capacidad legal para contratar.
              </p>
              <div className="p-4 bg-zinc-50 rounded-xl text-xs flex gap-3">
                <Zap size={24} className="text-blue-500 shrink-0" />
                <p>
                  <strong>Resumen:</strong> Si usas la web, aceptas estas reglas. Debes ser adulto
                  (+18) para comprar cualquier producto.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-zinc-500" /> 2. Precios y Medios de Pago
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                Todos los precios están en Pesos Chilenos (CLP) e incluyen IVA (19%). Los pagos se
                procesan mediante pasarelas seguras (Flow, Transbank, MercadoPago) cumpliendo con el
                estándar PCI-DSS.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-zinc-100 rounded-lg text-[10px] font-bold">
                  DÉBITO / REDCOMPRA
                </span>
                <span className="px-3 py-1 bg-zinc-100 rounded-lg text-[10px] font-bold">
                  CRÉDITO (HASTA 12 CUOTAS)
                </span>
                <span className="px-3 py-1 bg-zinc-100 rounded-lg text-[10px] font-bold">
                  TRANSFERENCIA ELECTRÓNICA
                </span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <Truck className="h-4 w-4 text-zinc-500" /> 3. Envíos y Logística
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                Operamos con envío regional en el **Biobío** y nacional en todo Chile. El riesgo de
                pérdida se transfiere al cliente al momento de la entrega por el transportista (Blue
                Express, Starken).
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>
                  <strong>Concepción Metropolitano:</strong> Entrega en 24-48h hábiles.
                </li>
                <li>
                  <strong>Resto de Chile:</strong> 2 a 5 días hábiles promedio.
                </li>
                <li>
                  <strong>Embalaje Discreto:</strong> Todos los paquetes son neutros, sin logos ni
                  descripciones de contenido exterior.
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-zinc-500" /> 4. Derecho a Retracto y Garantías
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                Conforme a la Ley 19.496, puedes retractarte de tu compra dentro de los{' '}
                <strong>10 días</strong> siguientes a la recepción, siempre que el producto esté
                sellado y en perfecto estado.
              </p>
              <div className="bg-zinc-900 text-white p-6 rounded-2xl">
                <h4 className="font-bold text-amber-400 mb-2 uppercase text-xs tracking-widest">
                  Garantía Legal 6x3
                </h4>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Si un producto presenta fallas técnicas de fábrica, tienes una garantía legal de{' '}
                  <strong>6 meses</strong>. Puedes elegir entre: Reparación, Cambio o Devolución del
                  dinero.
                </p>
                <Link href="/support" className="text-xs font-bold underline hover:text-amber-200">
                  Iniciar proceso de garantía →
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500" /> 5. Responsabilidad y Uso Médico
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                El contenido educativo de PranaKaia Grow tiene fines informativos. PranaKaia no
                promueve el consumo ilegal de sustancias. El usuario es el único responsable por el
                cumplimiento de la **Ley 20.000** en Chile en caso de autocultivo medicinal bajo
                receta médica.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-zinc-500" /> 6. Dudas Legales
            </h2>
            <div className="text-sm space-y-4">
              <p>¿Tienes dudas sobre los términos o tu compra?</p>
              <div className="flex gap-4">
                <a
                  href="mailto:soporte@pranakaia.com"
                  className="bg-zinc-100 px-4 py-2 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                >
                  soporte@pranakaia.com
                </a>
                <a
                  href="https://wa.me/569XXXXXXXX"
                  className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold hover:bg-green-200 transition-colors"
                >
                  WhatsApp Soporte
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Closing */}
        <div className="mt-12 text-center space-y-6">
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-bold text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al Inicio
            </Link>
          </div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black pb-12">
            PranaKaia Grow © 2026 · Concepción · Chile
          </p>
        </div>
      </div>
    </main>
  );
}
