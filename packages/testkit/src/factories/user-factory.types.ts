export type UserRole = 'admin' | 'customer' | 'supplier';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  /**
   * Placeholder password string — NOT for authentication.
   * Never hash or store this in a test database.
   */
  password: string;
  role: UserRole;
  emailVerified: Date | null;
  avatarUrl: string | null;
  phone: string | null;
  /** Chilean RUT (e.g. '12.345.678-9') */
  rut: string | null;
  addresses: ChileanTestAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChileanTestAddress {
  id: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: 'CL';
  isDefault: boolean;
}

export interface CreateUserOptions {
  email?: string;
  name?: string;
  role?: UserRole;
  emailVerified?: boolean;
  withAddress?: boolean;
}
