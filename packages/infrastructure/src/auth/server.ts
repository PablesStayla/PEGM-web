export interface MockUser {
  id: string;
  email: string;
  user_metadata?: { role?: string; [key: string]: unknown };
}

export interface MockSession {
  id: string;
}

export async function createClient() {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: 'mock-admin-user',
            email: 'admin@pranakaia.com',
            user_metadata: { role: 'SUPER_ADMIN' },
          },
        },
        error: null as { message: string } | null,
      }),
      getSession: async () => ({
        data: { session: { id: 'mock-session-id' } },
        error: null as { message: string } | null,
      }),
      signUp: async (params: {
        email?: string;
        password?: string;
        phone?: string;
        options?: { data?: Record<string, unknown> };
      }) => ({
        data: {
          user: {
            id: 'mock-customer-id',
            email: params?.email,
            user_metadata: params?.options?.data,
          },
        },
        error: null as { message: string } | null,
      }),
      signOut: async () => ({ error: null as { message: string } | null }),
      resetPasswordForEmail: async (_email: string, _options?: Record<string, unknown>) => ({
        data: {},
        error: null as { message: string } | null,
      }),
      exchangeCodeForSession: async (_code: string) => ({
        data: {},
        error: null as { message: string } | null,
      }),
      signInWithOtp: async (_params?: Record<string, unknown>) => ({
        data: {},
        error: null as { message: string } | null,
      }),
      signInWithPassword: async (_params?: Record<string, unknown>) => ({
        data: {},
        error: null as { message: string } | null,
      }),
    },
  };
}

export async function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('MISSING_SERVICE_ROLE');
  }
  return { ok: true };
}

export async function getCurrentUser(): Promise<MockUser | null> {
  return {
    id: 'mock-admin-user',
    email: 'admin@pranakaia.com',
    user_metadata: { role: 'SUPER_ADMIN' },
  };
}

export async function getCurrentSession(): Promise<MockSession | null> {
  return { id: 'mock-session-id' };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: authentication required');
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: login required');
  }
  if (user.user_metadata?.role !== 'ADMIN' && user.user_metadata?.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: admin access required');
  }
  return user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.user_metadata?.role === 'SUPER_ADMIN' || user?.user_metadata?.role === 'ADMIN';
}
