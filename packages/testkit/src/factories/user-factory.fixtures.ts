import { faker } from '@faker-js/faker';
import type { ChileanTestAddress } from './user-factory.types';

export const FIRST_NAMES = [
  'Sebastián',
  'Valentina',
  'Mateo',
  'Camila',
  'Diego',
  'Fernanda',
  'Ignacio',
  'Javiera',
  'Felipe',
  'Constanza',
];

export const LAST_NAMES = [
  'González',
  'Muñoz',
  'Rojas',
  'Díaz',
  'Pérez',
  'Sánchez',
  'Ramírez',
  'Flores',
  'Álvarez',
  'Torres',
];

export const CHILEAN_CITIES = ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta'];

export const CHILEAN_REGIONS = [
  'Región Metropolitana',
  'Valparaíso',
  'Biobío',
  'Coquimbo',
  'Antofagasta',
];

/**
 * Generate a fake Chilean RUT in the format '12.345.678-9'.
 */
export function makeChileanRut(): string {
  const num = faker.number.int({ min: 1_000_000, max: 25_000_000 });
  const formatted = num.toLocaleString('es-CL').replace(/\./g, '.');
  const verifier = faker.helpers.arrayElement('0123456789K'.split(''));
  return `${formatted}-${verifier}`;
}

export function makeChileanAddress(isDefault = false): ChileanTestAddress {
  return {
    id: faker.string.uuid(),
    street: `${faker.helpers.arrayElement(['Av.', 'Calle', 'Pasaje'])} ${faker.lorem.words(2)} ${faker.number.int({ min: 1, max: 9999 })}`,
    city: faker.helpers.arrayElement(CHILEAN_CITIES),
    region: faker.helpers.arrayElement(CHILEAN_REGIONS),
    postalCode: faker.string.numeric(7),
    country: 'CL',
    isDefault,
  };
}
