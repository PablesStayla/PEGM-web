'use client';

import { Button, Card } from '@pranakaia/ui';
import { Check, Copy, DollarSign, Gift, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export function ReferralSystem() {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, _setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  });

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (userId && userId.trim().length >= 6) {
      setReferralCode(`PRANA${userId.slice(0, 6).toUpperCase()}`);
    }
  }, []);

  const hasReferralCode = referralCode.length > 0;
  const referralUrl =
    typeof window !== 'undefined' && hasReferralCode
      ? `${window.location.origin}?ref=${referralCode}`
      : '';

  const handleCopyCode = async () => {
    if (!hasReferralCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {}
  };

  const handleCopyLink = async () => {
    if (!hasReferralCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {}
  };

  const handleShareWhatsApp = () => {
    if (!hasReferralCode) {
      return;
    }

    const message = `¡Hola! 👋 Te comparto mi código de referido de PranaKaia para que obtengas un 10% de descuento en tu primera compra: ${referralCode}\n\n¡También yo gano comisión por cada compra que hagas! 🎁\n\n${referralUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const statCards = [
    {
      icon: Users,
      label: 'Total Referidos',
      value: stats.totalReferrals,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Referidos Activos',
      value: stats.activeReferrals,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: DollarSign,
      label: 'Ganancias Totales',
      value: formatPrice(stats.totalEarnings),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Gift,
      label: 'Ganancias Pendientes',
      value: formatPrice(stats.pendingEarnings),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Programa de Referidos</h2>
        <p className="text-lg text-gray-600">
          Gana <span className="font-bold text-primary-600">10% de comisión</span> por cada compra
          de tus referidos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Referral Code Card */}
      <Card className="p-8 bg-linear-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tu Código de Referido</h3>
          <p className="text-gray-600">Comparte este código con tus amigos y gana comisiones</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          {/* Código */}
          <div className="flex gap-2">
            <div className="flex-1 bg-white px-6 py-4 rounded-lg border-2 border-primary-300 text-center">
              <p className="text-3xl font-bold text-primary-600 tracking-wider">{referralCode}</p>
            </div>
            <Button
              variant="default"
              onClick={handleCopyCode}
              disabled={!hasReferralCode}
              className={`px-6 ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          {!hasReferralCode && (
            <p className="text-sm text-center text-gray-600">
              Inicia sesión para generar tu código de referido.
            </p>
          )}

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link de Referido</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              />
              <Button variant="outline" onClick={handleCopyLink} disabled={!hasReferralCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Share Button */}
          <Button
            onClick={handleShareWhatsApp}
            disabled={!hasReferralCode}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Users className="w-5 h-5 mr-2" />
            Compartir por WhatsApp
          </Button>
        </div>
      </Card>

      {/* How it Works */}
      <Card className="p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">¿Cómo Funciona?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Comparte tu código',
              description: 'Envía tu código de referido a amigos y familiares',
            },
            {
              step: '2',
              title: 'Ellos obtienen descuento',
              description: 'Reciben 10% de descuento en su primera compra',
            },
            {
              step: '3',
              title: 'Tú ganas comisión',
              description: 'Obtienes 10% de comisión por cada compra que realicen',
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-8 bg-linear-to-r from-purple-50 to-pink-50">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Beneficios del Programa</h3>
        <ul className="space-y-3">
          {[
            'Gana 10% de comisión por cada compra de tus referidos',
            'Sin límite de referidos o ganancias',
            'Pagos automáticos cada mes',
            'Dashboard para rastrear tus referidos y ganancias',
            'Bonos especiales por alcanzar metas',
          ].map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <span className="text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
