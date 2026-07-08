/**
 * A shipping rate option returned by a provider.
 *
 * @example
 * ```ts
 * const rate: ShippingRate = {
 *   id: 'sr_1',
 *   name: 'Starken Express',
 *   price: 3990,
 *   minDays: 2,
 *   maxDays: 5,
 *   carrier: 'Starken',
 * };
 * ```
 */
export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  minDays?: number;
  maxDays?: number;
  freeOver?: number;
  carrier?: string;
}

/**
 * A geographic zone with associated shipping rates.
 *
 * @example
 * ```ts
 * const zone: ShippingZone = {
 *   id: 'sz_biobio',
 *   name: 'Bío-Bío',
 *   rates: [starkenRate, blueExpressRate],
 * };
 * ```
 */
export interface ShippingZone {
  id: string;
  name: string;
  rates: ShippingRate[];
}

/**
 * Repository port for shipping zone and rate lookups.
 *
 * @example
 * ```ts
 * class DrizzleShippingRepository implements ShippingRepository {
 *   async findZoneByRegion(regionName, countryCode) { ... }
 *   async getRatesForZone(zoneId) { ... }
 * }
 * ```
 */
export interface ShippingRepository {
  /** Finds a shipping zone by region name and country code. */
  findZoneByRegion(regionName: string, countryCode: string): Promise<ShippingZone | null>;
  /** Returns all shipping rates for a given zone. */
  getRatesForZone(zoneId: string): Promise<ShippingRate[]>;
}
