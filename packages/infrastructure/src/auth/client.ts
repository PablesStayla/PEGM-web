export function createClient() {
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
