import type { ShippingRate } from './shipping-repository';

/**
 * Input for calculating shipping rates.
 *
 * @example
 * ```ts
 * const input: CalculateRateInput = {
 *   destination: { country: 'CL', region: 'Bío-Bío', city: 'Concepción' },
 *   items: [{ weight: 0.5, quantity: 2, price: 29990 }],
 * };
 * ```
 */
export interface CalculateRateInput {
  destination: {
    country: string;
    region: string;
    city: string;
    address?: string;
  };
  items: Array<{
    weight?: number;
    quantity: number;
    price: number;
    dimensions?: { width: number; height: number; length: number };
  }>;
}

/**
 * Port for shipping rate calculation providers (Starken, BlueExpress, etc.).
 *
 * @example
 * ```ts
 * class StarkenProvider implements ShippingProvider {
 *   async calculateRates(input: CalculateRateInput): Promise<ShippingRate[]> { ... }
 * }
 * ```
 */
export interface ShippingProvider {
  /** Calculates available shipping rates for the given input. */
  calculateRates(input: CalculateRateInput): Promise<ShippingRate[]>;
}
