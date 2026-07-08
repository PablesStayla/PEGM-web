'use client';

import { Button, Input } from '@pranakaia/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Minus, Plus, Shield, ShoppingBag, Tag, Trash2, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  shippingProgress as calcShippingProgress,
  calculateIVA,
  calculateShipping,
  FREE_SHIPPING_THRESHOLD,
} from '@/config/shipping';
import { useCartActions, useCartItems, useCartTotal } from '@/store/selectors';

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const cartItems = useCartItems();
  const subtotal = useCartTotal();
  const { updateQuantity, removeItem } = useCartActions();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const shipping = calculateShipping(subtotal);
  const iva = calculateIVA(subtotal);
  const total = subtotal + shipping;
  const shippingProgress = calcShippingProgress(subtotal);

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      setCouponApplied(true);
      setTimeout(() => setCouponApplied(false), 3000);
      setCouponCode('');
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center py-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Tu carrito está vacío</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            ¡Descubre nuestros productos y comienza tu experiencia con PranaKaia!
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#1a4d2e] hover:bg-[#1a4d2e]/80 text-white font-semibold px-8"
          >
            <Link href="/products">Ver Productos</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-1">Carrito de Compras</h1>
          <p className="text-gray-500 mb-8">
            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </motion.div>

        {/* Free Shipping Progress Bar */}
        {subtotal < FREE_SHIPPING_THRESHOLD && (
          <motion.div
            className="mb-8 p-4 rounded-xl border border-white/6 bg-[#161616]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-[#4ade80]" />
                <span className="text-gray-300">
                  Agrega{' '}
                  <strong className="text-[#4ade80]">
                    ${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('es-CL')} CLP
                  </strong>{' '}
                  más para envío gratis
                </span>
              </div>
              <span className="text-xs text-gray-500">{Math.round(shippingProgress)}%</span>
            </div>
            <div className="w-full bg-white/6 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-linear-to-r from-[#4ade80] to-[#22c55e] h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${shippingProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {subtotal >= FREE_SHIPPING_THRESHOLD && (
          <motion.div
            className="mb-8 p-4 rounded-xl border border-[#4ade80]/20 bg-[#4ade80]/5"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center gap-2 text-[#4ade80] font-medium text-sm">
              <CheckCircle className="w-5 h-5" />
              ¡Felicidades! Tu pedido califica para envío gratis 🎉
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-white/6 bg-[#161616] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/6">
                <h2 className="text-lg font-semibold text-white">Productos en tu carrito</h2>
              </div>
              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      data-testid="cart-item"
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/6 hover:border-white/10 bg-white/2 transition-colors"
                    >
                      <Link
                        href={`/products/${item.product.slug || item.id}`}
                        className="w-18 h-18 rounded-lg overflow-hidden shrink-0 border border-white/8 bg-white/3"
                        style={{ width: '72px', height: '72px' }}
                      >
                        {item.product.image || item.product.images?.[0] ? (
                          <Image
                            src={item.product.image || item.product.images?.[0] || ''}
                            alt={item.product.name}
                            width={72}
                            height={72}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-[#1a4d2e]/30 to-prana-gold/20 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-[#4ade80] font-semibold mt-0.5">
                          ${item.product.price.toLocaleString('es-CL')} CLP
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-white/10 bg-white/4 overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid="quantity-decrease"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0 hover:bg-white/8 text-gray-400 hover:text-white rounded-none"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span
                            data-testid="cart-quantity"
                            className="w-8 text-center font-medium text-sm text-white"
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid="quantity-increase"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 hover:bg-white/8 text-gray-400 hover:text-white rounded-none"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid="remove-item"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <p className="font-bold text-white">
                          ${(item.product.price * item.quantity).toLocaleString('es-CL')} CLP
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-white/6 bg-[#161616] p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-white mb-6">Resumen del Pedido</h2>

              {/* Coupon Code */}
              <div className="mb-6 pb-6 border-b border-white/6">
                <label htmlFor="coupon" className="text-sm font-medium text-gray-400 mb-2 block">
                  Código de descuento
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="coupon"
                      placeholder="Ingresa tu código"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="pl-9 bg-white/4 border-white/10 text-white placeholder-gray-600 focus:border-prana-gold/40 h-9 text-sm"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    size="sm"
                    className="border-white/12 text-gray-300 hover:bg-white/6 hover:text-white hover:border-white/20"
                  >
                    {couponApplied ? '✓' : 'Aplicar'}
                  </Button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-amber-400 mt-1">Código no válido o expirado</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">
                    ${subtotal.toLocaleString('es-CL')} CLP
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Envío</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-[#4ade80] font-semibold">Gratis</span>
                    ) : (
                      <span className="text-white">${shipping.toLocaleString('es-CL')} CLP</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>IVA incluido (19%)</span>
                  <span>${iva.toLocaleString('es-CL')} CLP</span>
                </div>
                <div className="border-t border-white/6 pt-4 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-prana-gold">${total.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  asChild
                  className="w-full bg-[#1a4d2e] hover:bg-[#1a4d2e]/80 text-white font-semibold h-11"
                  data-testid="checkout-button"
                >
                  <Link href="/checkout">Proceder al Pago</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-white/12 text-gray-300 hover:bg-white/6 hover:text-white hover:border-white/20 h-10"
                >
                  <Link href="/products">Continuar Comprando</Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-white/6 space-y-3">
                {[
                  { Icon: Shield, text: 'Compra 100% segura con encriptación SSL' },
                  {
                    Icon: Truck,
                    text: `Envío gratis en compras sobre $${FREE_SHIPPING_THRESHOLD.toLocaleString('es-CL')} CLP`,
                  },
                  { Icon: CheckCircle, text: 'Garantía de devolución de 30 días' },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon className="w-4 h-4 text-[#4ade80] shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
