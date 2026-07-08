import type { ShippingRate, ShippingRepository, ShippingZone } from '@pranakaia/shipping';

/**
 * CHILE_ZONES
 * Configuración estática de zonas de envío para Chile.
 * En una fase posterior, esto se moverá a la base de datos para gestión dinámica.
 */
const CHILE_ZONES: ShippingZone[] = [
  {
    id: 'rm',
    name: 'Región Metropolitana',
    rates: [
      {
        id: 'rm-standard',
        name: 'Envío Estándar',
        price: 2990,
        minDays: 2,
        maxDays: 4,
        freeOver: 50000,
      },
      { id: 'rm-express', name: 'Envío Express', price: 5990, minDays: 1, maxDays: 2 },
    ],
  },
  {
    id: 'norte',
    name: 'Norte de Chile',
    rates: [
      {
        id: 'norte-standard',
        name: 'Envío Estándar',
        price: 4990,
        minDays: 4,
        maxDays: 7,
        freeOver: 80000,
      },
    ],
  },
  {
    id: 'sur',
    name: 'Sur de Chile',
    rates: [
      {
        id: 'sur-standard',
        name: 'Envío Estándar',
        price: 4990,
        minDays: 4,
        maxDays: 7,
        freeOver: 80000,
      },
      { id: 'sur-coordina', name: 'Coordina Envíos', price: 3490, minDays: 5, maxDays: 9 },
    ],
  },
  {
    id: 'default',
    name: 'Resto de Chile',
    rates: [
      {
        id: 'default-standard',
        name: 'Envío Estándar',
        price: 5990,
        minDays: 5,
        maxDays: 10,
        freeOver: 100000,
      },
    ],
  },
];

const RM_REGIONS = ['metropolitana', 'santiago', 'rm', 'región metropolitana'];

const ZONES_MAP: Record<string, ShippingZone | undefined> = {
  rm: CHILE_ZONES[0],
  norte: CHILE_ZONES[1],
  sur: CHILE_ZONES[2],
  default: CHILE_ZONES[3],
};

/**
 * DrizzleShippingRepository
 * Provee tarifas de envío para Chile.
 * Centralizado en @pranakaia/infrastructure para consistencia en el monorepo.
 */
export class DrizzleShippingRepository implements ShippingRepository {
  async findZoneByRegion(regionName: string, countryCode: string): Promise<ShippingZone | null> {
    if (countryCode.toLowerCase() !== 'cl') {
      return null;
    }

    const lower = (regionName ?? '').toLowerCase();
    const zoneId = this.determineZoneId(lower);
    return ZONES_MAP[zoneId] ?? null;
  }

  private determineZoneId(lower: string): string {
    if (this.isRmRegion(lower)) {
      return 'rm';
    }
    if (this.isNorteRegion(lower)) {
      return 'norte';
    }
    if (this.isSurRegion(lower)) {
      return 'sur';
    }
    return 'default';
  }

  private isRmRegion(lower: string): boolean {
    return RM_REGIONS.some((r) => lower.includes(r));
  }

  private isNorteRegion(lower: string): boolean {
    const keywords = ['norte', 'arica', 'tarapacá', 'antofagasta', 'atacama'];
    return keywords.some((k) => lower.includes(k));
  }

  private isSurRegion(lower: string): boolean {
    const keywords = ['sur', 'araucanía', 'los lagos', 'aysén', 'magallanes', 'bío'];
    return keywords.some((k) => lower.includes(k));
  }

  async getRatesForZone(zoneId: string): Promise<ShippingRate[]> {
    return ZONES_MAP[zoneId]?.rates ?? [];
  }
}
