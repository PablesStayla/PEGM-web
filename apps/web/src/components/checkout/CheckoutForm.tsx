'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { Button, Input, Label, RadioGroup, RadioGroupItem } from '@pranakaia/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Loader2, Lock, Truck } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { processCheckout } from '@/app/actions/checkout';
import { getShippingRates } from '@/app/actions/shipping';
import { useToast } from '@/hooks/use-toast';

interface CheckoutFormProps {
  cartId: string;
  cartTotal: number;
  turnstileSiteKey: string;
  customer: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  };
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  minDays?: number;
  maxDays?: number;
}

export function CheckoutForm({
  cartId: _cartId,
  cartTotal,
  turnstileSiteKey,
  customer,
}: CheckoutFormProps) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(processCheckout, null);
  const [isPendingRates, startTransitionRates] = useTransition();
  const [rates, setRates] = useState<ShippingOption[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Address State
  const [city, setCity] = useState('');
  const [region, _setRegion] = useState('');

  const selectedRate = rates.find((r) => r.id === selectedRateId);
  const finalTotal = cartTotal + (selectedRate?.price || 0);

  useEffect(() => {
    const fetchRates = () => {
      if (!city || city.length < 3) {
        return;
      }

      startTransitionRates(async () => {
        const result = await getShippingRates({
          city,
          region: region || 'Metropolitana',
          country: 'CL',
          subtotal: cartTotal,
          items: [],
        });

        if (result.success && result.rates) {
          setRates(result.rates);
          if (!selectedRateId && result.rates.length > 0) {
            setSelectedRateId(result.rates[0]?.id || '');
          }
        }
      });
    };

    const timer = setTimeout(fetchRates, 800);
    return () => clearTimeout(timer);
  }, [city, region, cartTotal, selectedRateId]);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast({
        variant: 'destructive',
        title: '❌ Error al Procesar',
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleSubmit = (formData: FormData) => {
    if (selectedRate) {
      formData.append('shippingAmount', selectedRate.price.toString());
      formData.append('shippingMethod', selectedRate.name);
      formData.append('shippingProviderId', selectedRate.id);
    }
    if (turnstileToken) {
      formData.append('turnstileToken', turnstileToken);
    }
    formAction(formData);
  };

  return (
    <div className="rounded-2xl border bg-white/80 backdrop-blur-md p-6 shadow-xl shadow-green-900/5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Información de Envío</h2>
        <p className="mt-1 text-sm text-gray-500">Confirma tu dirección de envío de forma segura</p>
      </div>

      <form action={handleSubmit} data-testid="checkout-form" className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer.email}
            readOnly
            className="bg-gray-50/50 border-gray-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Juan"
              required
              className="focus:ring-green-500"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Pérez"
              required
              className="focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            name="address"
            defaultValue={''}
            placeholder="Av. Providencia 1234"
            required
            className="focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Ciudad / Comuna</Label>
            <Input
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Santiago"
              required
              className="focus:ring-green-500"
            />
          </div>
          <div>
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              name="country"
              defaultValue={'Chile'}
              readOnly
              className="bg-gray-50/50"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="postalCode">Código Postal</Label>
          <Input
            id="postalCode"
            name="postalCode"
            defaultValue={''}
            placeholder="7500000"
            className="focus:ring-green-500"
          />
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 flex items-start gap-3 shadow-inner"
        >
          <div className="pt-1">
            <input
              id="isDiscreteShipping"
              name="isDiscreteShipping"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600 transition-all"
            />
          </div>
          <div className="text-sm">
            <Label htmlFor="isDiscreteShipping" className="font-bold text-green-900 cursor-pointer">
              📦 Envío Discreto (Recomendado)
            </Label>
            <p className="text-green-700 mt-1">
              Tu pedido llegará en una caja neutral, sin logos ni marcas externas que revelen el
              contenido.
            </p>
          </div>
        </motion.div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-green-600" /> Método de Envío
          </h3>

          <div className="relative min-h-25">
            <AnimatePresence mode="wait">
              {isPendingRates ? (
                <motion.div
                  key="loading-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border rounded-xl p-4 bg-gray-50/40 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent" />
                      <div className="flex items-center space-x-4">
                        <div className="h-4 w-4 bg-gray-200/80 rounded-full" />
                        <div>
                          <div className="h-4 w-24 bg-gray-200/80 rounded mb-2" />
                          <div className="h-3 w-32 bg-gray-200/80 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-16 bg-gray-200/80 rounded" />
                    </div>
                  ))}
                </motion.div>
              ) : rates.length > 0 ? (
                <motion.div
                  key="rates-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <RadioGroup
                    value={selectedRateId}
                    onValueChange={setSelectedRateId}
                    className="space-y-3"
                  >
                    <AnimatePresence>
                      {rates.map((rate) => (
                        <motion.div
                          key={rate.id}
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition-colors duration-200 ${selectedRateId === rate.id ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem
                              value={rate.id}
                              id={rate.id}
                              className="text-green-600"
                            />
                            <Label
                              htmlFor={rate.id}
                              className="cursor-pointer font-medium text-gray-900"
                            >
                              {rate.name}
                              {rate.minDays && (
                                <span className="block text-xs text-gray-500 font-normal mt-0.5">
                                  Llega en {rate.minDays}-{rate.maxDays} días
                                </span>
                              )}
                            </Label>
                          </div>
                          <div className="font-bold text-gray-900">
                            {rate.price === 0 ? 'GRATIS' : `$${rate.price.toLocaleString('es-CL')}`}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </RadioGroup>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500 italic p-4 bg-gray-50/80 rounded-xl border border-dashed border-gray-200 text-center"
                >
                  Ingresa tu ciudad para ver opciones de envío disponibles.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center text-xl font-bold text-gray-900">
            <span>Total a Pagar:</span>
            <motion.span
              key={finalTotal}
              initial={{ scale: 1.1, color: '#16a34a' }}
              animate={{ scale: 1, color: '#111827' }}
              transition={{ duration: 0.3 }}
            >
              ${finalTotal.toLocaleString('es-CL')}
            </motion.span>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Método de Pago</h3>
          <div className="flex items-center space-x-3 border rounded-xl p-4 bg-gray-50 border-gray-200/60">
            <CreditCard className="w-6 h-6 text-gray-700" />
            <div>
              <div className="font-medium text-gray-900">Pasarela de Pagos Segura</div>
              <div className="text-sm text-gray-500">
                Serás redirigido de forma encriptada para procesar el pago.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 font-medium">
            <Lock className="w-4 h-4 text-green-600" />
            <span>Tus datos están protegidos con encriptación SSL de grado bancario</span>
          </div>

          <div className="mt-2 flex justify-center bg-white p-2 rounded-lg border border-gray-100">
            <Turnstile
              siteKey={turnstileSiteKey}
              onSuccess={(token: string) => setTurnstileToken(token)}
              onError={() =>
                toast({
                  variant: 'destructive',
                  title: 'Error de Seguridad',
                  description: 'Por favor, recarga la página para verificar conexión.',
                })
              }
            />
          </div>
        </div>

        <SubmitButton finalTotal={finalTotal} isDisabled={!selectedRateId || !turnstileToken} />
      </form>
    </div>
  );
}

function SubmitButton({ finalTotal, isDisabled }: { finalTotal: number; isDisabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full relative py-6 text-lg tracking-wide shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] hover:bg-green-700 bg-green-600 transition-all duration-300 rounded-xl font-bold"
      size="lg"
      disabled={pending || isDisabled}
    >
      {pending ? (
        <span className="flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Procesando de forma segura...
        </span>
      ) : (
        <span className="flex items-center justify-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Pagar ${finalTotal.toLocaleString('es-CL')}
        </span>
      )}
    </Button>
  );
}
