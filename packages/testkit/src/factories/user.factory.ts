import { faker } from '@faker-js/faker';
import {
  FIRST_NAMES,
  LAST_NAMES,
  makeChileanAddress,
  makeChileanRut,
} from './user-factory.fixtures';
import type { CreateUserOptions, TestUser } from './user-factory.types';

export * from './user-factory.types';

/**
 * Create a single test user.
 */
export function createMockUser(options: CreateUserOptions = {}): TestUser {
  const firstName = faker.helpers.arrayElement(FIRST_NAMES);
  const lastName = faker.helpers.arrayElement(LAST_NAMES);
  const name = options.name ?? `${firstName} ${lastName}`;
  const email =
    options.email ??
    `${firstName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')}.${lastName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')}@example.com`;

  const addresses = options.withAddress ? [makeChileanAddress(true)] : [];

  return {
    id: faker.string.uuid(),
    email,
    name,
    password: 'Test@12345!',
    role: options.role ?? 'customer',
    emailVerified: options.emailVerified ? faker.date.past({ years: 1 }) : null,
    avatarUrl: null,
    phone: `+569${faker.string.numeric(8)}`,
    rut: makeChileanRut(),
    addresses,
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 30 }),
  };
}

/** Create multiple test users. */
export function createMockUsers(count: number, options: CreateUserOptions = {}): TestUser[] {
  return Array.from({ length: count }, () => createMockUser(options));
}

/** Create an admin user. */
export function createAdminUser(options: Omit<CreateUserOptions, 'role'> = {}): TestUser {
  return createMockUser({ ...options, role: 'admin', emailVerified: true });
}

/** Create an unverified customer. */
export function createUnverifiedUser(
  options: Omit<CreateUserOptions, 'emailVerified'> = {},
): TestUser {
  return createMockUser({ ...options, role: 'customer', emailVerified: false });
}

/** Create a supplier/vendor user. */
export function createSupplierUser(options: Omit<CreateUserOptions, 'role'> = {}): TestUser {
  return createMockUser({ ...options, role: 'supplier', emailVerified: true });
}
