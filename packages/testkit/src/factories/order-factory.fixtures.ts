import { faker } from '@faker-js/faker';
import type { ChileanAddress } from './order-factory.types';
import { CHILEAN_CITIES, CHILEAN_REGIONS, FIRST_NAMES, LAST_NAMES } from './user-factory.fixtures';

export const IVA_RATE = 0.19;

export function makeChileanAddress(): ChileanAddress {
  const first = faker.helpers.arrayElement(FIRST_NAMES);
  const last = faker.helpers.arrayElement(LAST_NAMES);
  return {
    name: `${first} ${last}`,
    street: `${faker.helpers.arrayElement(['Av.', 'Calle', 'Pasaje'])} ${faker.lorem.words(2)} ${faker.number.int({ min: 1, max: 9999 })}`,
    city: faker.helpers.arrayElement(CHILEAN_CITIES),
    region: faker.helpers.arrayElement(CHILEAN_REGIONS),
    postalCode: faker.string.numeric(7),
    country: 'CL',
    phone: `+569${faker.string.numeric(8)}`,
  };
}

export function makeOrderNumber(date: Date): string {
  const d = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = faker.string.numeric(5).padStart(5, '0');
  return `PK-${d}-${seq}`;
}
