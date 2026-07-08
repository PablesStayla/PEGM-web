import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Cookie,
  Eye,
  FileText,
  Globe,
  Lock,
  Mail,
  MapPin,
  Scale,
  Server,
  Shield,
  UserCheck,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad | PranaKaia Grow',
  description:
    'Política de privacidad de PranaKaia Grow. Información detallada sobre cómo recopilamos, usamos y protegemos sus datos bajo estándares internacionales y la Ley 19.628 de Chile.',
  keywords: [
    'política de privacidad Chile',
    'protección de datos e-commerce',
    'GDPR Chile',
    'Ley 19.628',
    'comercio seguro',
    'PranaKaia Grow Concepción',
  ],
};

export default function PrivacyPage() {
  const lastUpdated = '6 de marzo de 2026';

  return (
    <main className="min-h-screen bg-zinc-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Layered Summary Header */}
        <div className="bg-zinc-900 rounded-3xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-2 rounded-xl">
                <Shield className="text-green-400 h-6 w-6" />
              </div>
              <span className="text-sm font-bold tracking-widest uppercase text-green-400">
                Data Protection Officer (DPO) Certified
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
              Política de Privacidad
            </h1>
            <p className="text-gray-400 max-w-2xl mb-6">
              Esta política explica cómo protegemos tu información en PranaKaia Grow, actuando
              conforme a la
              <strong> Ley Nº 19.628</strong> (Chile) y bajo los estándares del
              <strong> Reglamento General de Protección de Datos (GDPR)</strong>.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
              <span className="bg-white/10 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Última actualización: {lastUpdated}
              </span>
              <span className="bg-white/10 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Concepción, Chile
              </span>
            </div>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <Eye className="text-blue-500 mb-3 h-5 w-5" />
            <h3 className="font-bold text-sm mb-1 uppercase tracking-tight">Transparencia</h3>
            <p className="text-xs text-gray-500">
              Solo recolectamos datos necesarios para operar y mejorar tu experiencia.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <Lock className="text-green-500 mb-3 h-5 w-5" />
            <h3 className="font-bold text-sm mb-1 uppercase tracking-tight">Seguridad</h3>
            <p className="text-xs text-gray-500">
              Cifrado de grado militar (TLS 1.3) en todas las transacciones financieras.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <UserCheck className="text-purple-500 mb-3 h-5 w-5" />
            <h3 className="font-bold text-sm mb-1 uppercase tracking-tight">Tu Control</h3>
            <p className="text-xs text-gray-500">
              Accede, rectifica o elimina tus datos en cualquier momento desde tu panel.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          {/* 1. Responsable */}
          <section
            id="responsable"
            className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-zinc-100 p-2 rounded-xl">
                <Globe className="h-5 w-5 text-zinc-600" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                1. Quiénes Somos
              </h2>
            </div>
            <div className="prose prose-zinc max-w-none text-zinc-600 space-y-4">
              <p>
                El responsable del tratamiento de tus datos es <strong>Pranalab SPA</strong>{' '}
                (operando bajo la marca PranaKaia Grow).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                    RUT Empresa
                  </p>
                  <p className="text-sm font-bold text-zinc-800">77.452.XXX-X</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                    Domicilio Legal
                  </p>
                  <p className="text-sm font-bold text-zinc-800">
                    Concepción, Región del Biobío, Chile
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                    Contacto Privacidad
                  </p>
                  <p className="text-sm font-bold text-zinc-800">privacidad@pranakaia.com</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                    Encargado DPO
                  </p>
                  <p className="text-sm font-bold text-zinc-800">
                    Comité de Riesgos y Cumplimiento
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Alcance y Edad */}
          <section
            id="alcance"
            className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-50 p-2 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                2. Alcance y Restricción de Edad
              </h2>
            </div>
            <div className="prose prose-zinc max-w-none text-zinc-600">
              <p className="font-bold text-red-600">
                Nuestros productos y contenidos educativos están dirigidos exclusivamente a mayores
                de 18 años (o 21 años según la jurisdicción local).
              </p>
              <p>
                Implementamos un sistema de verificación de edad (KYC) antes de completar cualquier
                transacción sensible. No recopilamos datos de menores; si detectamos información de
                un menor de edad, será eliminada de forma inmediata y definitiva.
              </p>
            </div>
          </section>

          {/* 3. Datos Recopilados */}
          <section id="datos" className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-zinc-100 p-2 rounded-xl">
                <FileText className="h-5 w-5 text-zinc-600" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                3. Datos que Recopilamos
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-black uppercase text-zinc-800 text-xs tracking-widest">
                  Identificación
                </h4>
                <ul className="list-disc list-inside text-zinc-500 space-y-1">
                  <li>Nombre, Apellido y RUT</li>
                  <li>Fecha de nacimiento</li>
                  <li>Verificación biométrica (si aplica KYC)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-black uppercase text-zinc-800 text-xs tracking-widest">
                  Transaccional
                </h4>
                <ul className="list-disc list-inside text-zinc-500 space-y-1">
                  <li>Historial de pedidos</li>
                  <li>Dirección de despacho y facturación</li>
                  <li>Método de pago (Tokenizado)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-black uppercase text-zinc-800 text-xs tracking-widest">
                  Técnico & Analítica
                </h4>
                <ul className="list-disc list-inside text-zinc-500 space-y-1">
                  <li>Dirección IP y Geo-ubicación</li>
                  <li>Huella digital del dispositivo</li>
                  <li>Comportamiento de navegación</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-black uppercase text-zinc-800 text-xs tracking-widest">
                  Comunicación
                </h4>
                <ul className="list-disc list-inside text-zinc-500 space-y-1">
                  <li>Preferencias de Newsletter</li>
                  <li>Registros de soporte al cliente</li>
                  <li>Interacción en foros educativos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Finalidades */}
          <section
            id="finalidades"
            className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-50 p-2 rounded-xl">
                <BadgeCheck className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                4. Finalidades y Bases Legales
              </h2>
            </div>
            <div className="space-y-4 text-sm text-zinc-600">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 italic">
                Operamos bajo las bases de: Ejecución de contrato, Obligación legal (AML/KYC),
                Interés legítimo y Consentimiento.
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex gap-2">
                  <span className="text-green-500 font-bold">●</span>
                  <span>
                    <strong>Operación:</strong> Gestionar pedidos, envíos y devoluciones.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500 font-bold">●</span>
                  <span>
                    <strong>Seguridad:</strong> Prevención de fraude y verificación de mayoría de
                    edad.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500 font-bold">●</span>
                  <span>
                    <strong>Soporte:</strong> Resolver tus dudas a través de nuestro equipo en
                    Concepción.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500 font-bold">●</span>
                  <span>
                    <strong>Educación:</strong> Envío de guías de cultivo y noticias de la industria
                    (opcional).
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 5. Terceros */}
          <section
            id="terceros"
            className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-zinc-100 p-2 rounded-xl">
                <Server className="h-5 w-5 text-zinc-600" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                5. Compartición de Datos
              </h2>
            </div>
            <div className="prose prose-zinc max-w-none text-zinc-600">
              <p>Compartimos tus datos estrictamente con partners certificados para el servicio:</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  'Flow',
                  'Transbank',
                  'Stripe',
                  'Blue Express',
                  'Google Cloud',
                  'AWS Chile',
                  'Postmark',
                ].map((partner) => (
                  <span
                    key={partner}
                    className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold border border-zinc-200"
                  >
                    {partner}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs italic">
                * Nunca vendemos tus datos a terceros para publicidad externa. Todas las
                transferencias internacionales cumplen con las Cláusulas Contractuales Estándar
                (SCC).
              </p>
            </div>
          </section>

          {/* 6. Derechos ARCO */}
          <section
            id="derechos"
            className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-50 p-2 rounded-xl">
                <Scale className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                6. Tus Derechos (ARCO)
              </h2>
            </div>
            <div className="prose prose-zinc max-w-none text-zinc-600 space-y-4 text-sm">
              <p>Tienes derecho a:</p>
              <ul className="grid grid-cols-2 gap-2 font-bold text-zinc-800">
                <li>Acceso (Conocer qué datos tenemos)</li>
                <li>Rectificación (Corregir errores)</li>
                <li>Cancelación (Eliminar cuenta)</li>
                <li>Oposición (Negarte al tratamiento)</li>
                <li>Portabilidad (Llevar tus datos)</li>
                <li>Limitación (Restringir el uso)</li>
              </ul>
              <div className="bg-purple-900 text-white p-6 rounded-2xl shadow-lg shadow-purple-200/50">
                <p className="font-bold mb-2">¿Cómo ejercerlos?</p>
                <p className="text-purple-200 text-xs mb-4">
                  Envía un correo con el asunto "Derechos Privacidad" adjuntando una copia de tu ID
                  para confirmar titularidad.
                </p>
                <a
                  href="mailto:privacidad@pranakaia.com"
                  className="inline-flex items-center gap-2 bg-white text-purple-900 px-6 py-2 rounded-xl font-black text-sm hover:bg-purple-50 transition-colors"
                >
                  <Mail className="h-4 w-4" /> Enviar Solicitud
                </a>
              </div>
            </div>
          </section>

          {/* 7. Cookies */}
          <section
            id="cookies"
            className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-50 p-2 rounded-xl">
                <Cookie className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                7. Cookies y Tecnologías
              </h2>
            </div>
            <div className="prose prose-zinc max-w-none text-zinc-600 text-sm">
              <p>
                Usamos cookies de sesión para mantener tu carrito y cookies analíticas
                (anonimizadas) para saber qué guías educativas son las más leídas. Puedes configurar
                tu navegador para bloquearlas, aunque esto afectará el proceso de compra.
              </p>
            </div>
          </section>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center space-y-6">
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-bold text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al Inicio
            </Link>
          </div>
          <div className="p-8 border-t border-zinc-200">
            <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-black">
              PranaKaia Grow © 2026 · Concepción · Chile
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
