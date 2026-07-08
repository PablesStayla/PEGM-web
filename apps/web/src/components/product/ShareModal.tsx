'use client';

import {
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@pranakaia/ui';
import {
  Check,
  Copy,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  QrCode,
  Twitter,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
  productPrice?: number;
  productUrl: string;
}

export function ShareModal({
  isOpen,
  onClose,
  // productId no se usa directamente en este modal
  productId: _productId,
  productName,
  productImage,
  productPrice,
  productUrl,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareText = `¡Mira este producto increíble! ${productName}${productPrice ? ` - ${formatPrice(productPrice)}` : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {}
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${productUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const handleEmailShare = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(`${shareText}\n\n${productUrl}`)}`;
    window.location.href = emailUrl;
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      onClick: handleWhatsAppShare,
      color: 'hover:bg-green-50 hover:text-green-600',
      iconColor: 'text-green-600',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      onClick: handleFacebookShare,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      onClick: handleTwitterShare,
      color: 'hover:bg-sky-50 hover:text-sky-600',
      iconColor: 'text-sky-600',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      onClick: handleLinkedInShare,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      iconColor: 'text-blue-700',
    },
    {
      name: 'Email',
      icon: Mail,
      onClick: handleEmailShare,
      color: 'hover:bg-gray-50 hover:text-gray-700',
      iconColor: 'text-gray-600',
    },
  ];

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Compartir Producto</ModalTitle>
          <ModalDescription>
            Comparte este increíble producto con tus amigos y familiares
          </ModalDescription>
        </ModalHeader>

        <div className="p-6 space-y-6">
          {/* Product Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {productImage && (
              <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-white">
                <Image
                  src={productImage}
                  alt={productName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{productName}</p>
              {productPrice && (
                <p className="text-sm text-primary-600 font-semibold">
                  {formatPrice(productPrice)}
                </p>
              )}
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link del Producto
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={productUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className={`shrink-0 ${copied ? 'bg-green-100 border-green-500 text-green-700' : ''}`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Compartir en Redes Sociales
            </label>
            <div className="grid grid-cols-5 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 transition-all',
                    option.color,
                  )}
                  title={`Compartir en ${option.name}`}
                >
                  <option.icon className={cn('w-6 h-6', option.iconColor)} />
                  <span className="text-xs font-medium text-gray-700">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* QR Code Toggle */}
          <div>
            <Button variant="outline" onClick={() => setShowQR(!showQR)} className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              {showQR ? 'Ocultar' : 'Mostrar'} Código QR
            </Button>

            {showQR && (
              <div className="mt-4 flex flex-col items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-lg">
                {/* QR placeholder — instalar qrcode.react si se necesita QR real */}
                <div className="w-[200px] h-[200px] border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Escanea este código QR para ver el producto
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="px-6 pb-6">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
