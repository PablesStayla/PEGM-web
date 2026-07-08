import {
  type CalculateRateInput,
  type ShippingProvider,
  type ShippingRate,
  ShippingService,
} from '@pranakaia/shipping';
import { DrizzleShippingRepository } from '@/infrastructure/repositories/drizzle-shipping-repository';

export class HybridShippingProvider implements ShippingProvider {
  async calculateRates(input: CalculateRateInput): Promise<ShippingRate[]> {
    const isSantiago =
      input.destination.region.toLowerCase().includes('metropolitana') ||
      input.destination.city.toLowerCase().includes('santiago');
    return [
      {
        id: 'prov_starken_standard',
        name: 'Starken Estándar',
        price: isSantiago ? 3490 : 5490,
        minDays: 2,
        maxDays: 4,
        carrier: 'Starken',
      },
      {
        id: 'prov_blue_express',
        name: 'Blue Express Courier',
        price: isSantiago ? 3990 : 5990,
        minDays: 1,
        maxDays: 3,
        carrier: 'Blue Express',
      },
    ];
  }
}

// Singleton instance
let shippingServiceInstance: ShippingService | null = null;

export function getShippingService(): ShippingService {
  if (!shippingServiceInstance) {
    const repository = new DrizzleShippingRepository();
    const shippingProvider = new HybridShippingProvider();

    shippingServiceInstance = new ShippingService(repository, shippingProvider);
  }
  return shippingServiceInstance;
}
