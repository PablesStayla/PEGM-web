export interface MockUser {
  id: string;
  email: string;
  user_metadata: { role: string };
  aud: string;
  created_at: string;
  app_metadata: Record<string, unknown>;
}

export async function requireAdmin(): Promise<MockUser> {
  return {
    id: 'mock-admin-user',
    email: 'admin@pranakaia.com',
    user_metadata: { role: 'superadmin' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
  };
}

export async function getCurrentUser(): Promise<MockUser> {
  return {
    id: 'mock-admin-user',
    email: 'admin@pranakaia.com',
    user_metadata: { role: 'superadmin' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
  };
}

export async function getSession() {
  return null;
}

export async function isAuthenticated() {
  return false;
}

export async function isAdmin(): Promise<boolean> {
  return true;
}

export async function requireAuth(): Promise<MockUser> {
  return {
    id: 'mock-admin-user',
    email: 'admin@pranakaia.com',
    user_metadata: { role: 'superadmin' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
  };
}

export * from './two-factor';
