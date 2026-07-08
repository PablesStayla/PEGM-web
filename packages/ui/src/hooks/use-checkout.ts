'use client';

/**
 * useCheckout — Hook para gestión del flujo de checkout.
 *
 * Encapsula los estados de UI del proceso de pago:
 * selección de dirección, método de pago e iniciación de sesión con pasarela.
 *
 * @module @pranakaia/hooks/use-checkout
 */
import { useCallback, useState } from 'react';

export type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review' | 'processing' | 'done';

export interface CheckoutAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface UseCheckoutReturn {
  step: CheckoutStep;
  shippingAddress: CheckoutAddress | null;
  billingAddress: CheckoutAddress | null;
  sameAsShipping: boolean;
  isProcessing: boolean;
  error: string | null;
  setStep: (step: CheckoutStep) => void;
  setShippingAddress: (address: CheckoutAddress) => void;
  setBillingAddress: (address: CheckoutAddress) => void;
  setSameAsShipping: (same: boolean) => void;
  setError: (error: string | null) => void;
  startProcessing: () => void;
  finishProcessing: () => void;
  reset: () => void;
}

interface CheckoutStateShape {
  step: CheckoutStep;
  shippingAddress: CheckoutAddress | null;
  billingAddress: CheckoutAddress | null;
  sameAsShipping: boolean;
  isProcessing: boolean;
  error: string | null;
}

const INITIAL_STATE: CheckoutStateShape = {
  step: 'address' as CheckoutStep,
  shippingAddress: null,
  billingAddress: null,
  sameAsShipping: true,
  isProcessing: false,
  error: null,
};

export function useCheckout(): UseCheckoutReturn {
  const [state, setState] = useState<CheckoutStateShape>(INITIAL_STATE);

  const setStep = useCallback((step: CheckoutStep) => setState((s) => ({ ...s, step })), []);
  const setShippingAddress = useCallback(
    (shippingAddress: CheckoutAddress) => setState((s) => ({ ...s, shippingAddress })),
    [],
  );
  const setBillingAddress = useCallback(
    (billingAddress: CheckoutAddress) => setState((s) => ({ ...s, billingAddress })),
    [],
  );
  const setSameAsShipping = useCallback(
    (sameAsShipping: boolean) => setState((s) => ({ ...s, sameAsShipping })),
    [],
  );
  const setError = useCallback((error: string | null) => setState((s) => ({ ...s, error })), []);
  const startProcessing = useCallback(
    () => setState((s) => ({ ...s, isProcessing: true, error: null, step: 'processing' })),
    [],
  );
  const finishProcessing = useCallback(
    () => setState((s) => ({ ...s, isProcessing: false, step: 'done' })),
    [],
  );
  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return {
    ...state,
    setStep,
    setShippingAddress,
    setBillingAddress,
    setSameAsShipping,
    setError,
    startProcessing,
    finishProcessing,
    reset,
  };
}
