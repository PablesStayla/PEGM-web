import { Result } from '@pranakaia/shared-kernel';
import type { ShippingProvider, ShippingRate, ShippingRepository } from '../index';

export interface CalculateShippingParams {
  region: string;
  country: string;
  subtotal: number;
  city?: string;
  items?: Array<{
    price: number;
    productId: string;
    quantity: number;
    weight?: number;
  }>;
}

const VALID_CHILEAN_REGIONS = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
] as const;

/**
 * Application service for shipping rate calculation.
 *
 * Combines provider and internal rates, then applies
 * business rules (free shipping thresholds, profitability checks).
 *
 * @example
 * ```ts
 * const service = new ShippingService(repo, provider);
 * const rates = await service.calculateOptions({ region: 'Metropolitana', country: 'CL', subtotal: 15000 });
 * ```
 */
export class ShippingService {
  constructor(
    private readonly shippingRepository: ShippingRepository,
    private readonly shippingProvider?: ShippingProvider,
  ) {}

  async calculateOptions(params: CalculateShippingParams): Promise<Result<ShippingRate[], Error>> {
    if (params.country === 'CL' && !this.isValidChileanRegion(params.region)) {
      return Result.ok([]);
    }

    const [providerRatesRes, internalRatesRes] = await Promise.all([
      this.getProviderRates(params),
      this.getInternalRates(params),
    ]);

    if (!providerRatesRes.success) {
      return Result.err(providerRatesRes.errorValue);
    }
    if (!internalRatesRes.success) {
      return Result.err(internalRatesRes.errorValue);
    }

    const rates = [...providerRatesRes.getValue(), ...internalRatesRes.getValue()];
    return Result.ok(this.applyBusinessRules(rates, params.subtotal));
  }

  private async getProviderRates(
    params: CalculateShippingParams,
  ): Promise<Result<ShippingRate[], Error>> {
    const hasData = params.city && params.items && params.items.length > 0;
    if (!this.shippingProvider || !hasData) {
      return Result.ok([]);
    }
    const providerResult = await this.shippingProvider.calculateRates({
      destination: {
        country: params.country,
        region: params.region,
        city: params.city as string,
      },
      items: params.items!.map((i) => ({ ...i, weight: i.weight || 1 })),
    });
    // Provider returns ShippingRate[] directly — wrap in Result.ok
    return Result.ok(providerResult as unknown as ShippingRate[]);
  }

  private async getInternalRates(
    params: CalculateShippingParams,
  ): Promise<Result<ShippingRate[], Error>> {
    const zone = await this.shippingRepository.findZoneByRegion(params.region, params.country);

    if (!zone) {
      return Result.ok([]);
    }

    const rates = await this.shippingRepository.getRatesForZone(zone.id);
    return Result.ok(rates);
  }

  private applyBusinessRules(rates: ShippingRate[], subtotal: number): ShippingRate[] {
    return rates.map((rate) => {
      const withFreeRule = this.applyFreeShippingRule(rate, subtotal);
      return this.checkProfitability(withFreeRule, subtotal);
    });
  }

  private applyFreeShippingRule(rate: ShippingRate, subtotal: number): ShippingRate {
    const isFree = rate.freeOver != null && subtotal >= rate.freeOver;
    if (!isFree) {
      return rate;
    }
    return { ...rate, price: 0, name: `${rate.name} (Gratis)` };
  }

  private checkProfitability(rate: ShippingRate, subtotal: number): ShippingRate {
    const isUnprofitable = subtotal > 5000 && rate.price > subtotal * 0.5;
    if (isUnprofitable) {
      return { ...rate, meta: undefined, unprofitable: true } as unknown as ShippingRate;
    }
    return rate;
  }

  private isValidChileanRegion(region: string): boolean {
    return VALID_CHILEAN_REGIONS.some(
      (vr) => region.toLowerCase().includes(vr.toLowerCase()) || region === 'Metropolitana',
    );
  }
}
