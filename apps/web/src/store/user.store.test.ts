import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserStore } from './index';

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const sampleUser = {
  id: 'user-123',
  name: 'Juan Test',
  email: 'juan@test.com',
  role: 'customer' as const,
  addresses: [],
};

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null, isAuthenticated: false, loading: false });
    localStorageMock.clear();
  });

  describe('setUser', () => {
    it('sets user and marks as authenticated', () => {
      useUserStore.getState().setUser(sampleUser as never);

      expect(useUserStore.getState().user?.id).toBe('user-123');
      expect(useUserStore.getState().isAuthenticated).toBe(true);
    });

    it('clears user and marks as unauthenticated when called with null', () => {
      useUserStore.getState().setUser(sampleUser as never);
      useUserStore.getState().setUser(null);

      expect(useUserStore.getState().user).toBeNull();
      expect(useUserStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user session', () => {
      useUserStore.getState().setUser(sampleUser as never);
      useUserStore.getState().logout();

      expect(useUserStore.getState().user).toBeNull();
      expect(useUserStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('merges partial updates into current user', () => {
      useUserStore.getState().setUser(sampleUser as never);
      useUserStore.getState().updateUser({ name: 'Juan Actualizado' });

      expect(useUserStore.getState().user?.name).toBe('Juan Actualizado');
      expect(useUserStore.getState().user?.email).toBe('juan@test.com'); // unchanged
    });

    it('does nothing when there is no user', () => {
      useUserStore.getState().updateUser({ name: 'Ghost' });
      expect(useUserStore.getState().user).toBeNull();
    });
  });

  describe('addAddress', () => {
    it('adds a new address to user', () => {
      useUserStore.getState().setUser(sampleUser as never);
      useUserStore.getState().addAddress({
        street: 'Av. Apoquindo 3000',
        city: 'Las Condes',
        region: 'RM',
        country: 'Chile',
        postalCode: '7550000',
        isDefault: true,
      } as never);

      expect(useUserStore.getState().user?.addresses).toHaveLength(1);
    });

    it('generates a unique id for the new address', () => {
      useUserStore.getState().setUser(sampleUser as never);
      useUserStore.getState().addAddress({ street: 'Calle 1' } as never);
      useUserStore.getState().addAddress({ street: 'Calle 2' } as never);

      const addresses = useUserStore.getState().user?.addresses ?? [];
      const ids = addresses.map((a) => a.id);
      expect(new Set(ids).size).toBe(2); // unique IDs
    });

    it('does nothing when there is no user', () => {
      useUserStore.getState().addAddress({ street: 'Nowhere' } as never);
      expect(useUserStore.getState().user).toBeNull();
    });
  });

  describe('removeAddress', () => {
    it('removes address by id', () => {
      useUserStore.getState().setUser(sampleUser as never);
      useUserStore.getState().addAddress({ street: 'Calle A' } as never);
      const addressId = useUserStore.getState().user!.addresses![0].id;

      useUserStore.getState().removeAddress(addressId);

      expect(useUserStore.getState().user?.addresses).toHaveLength(0);
    });

    it('does not remove other addresses', () => {
      useUserStore.getState().setUser(sampleUser as never);
      useUserStore.getState().addAddress({ street: 'Calle A' } as never);
      useUserStore.getState().addAddress({ street: 'Calle B' } as never);

      const addresses = useUserStore.getState().user!.addresses!;
      useUserStore.getState().removeAddress(addresses[0].id);

      const remainingAddresses = useUserStore.getState().user?.addresses ?? [];
      expect(remainingAddresses).toHaveLength(1);
      expect(remainingAddresses[0]?.street).toBe('Calle B');
    });
  });

  describe('updateAddress', () => {
    it('updates specific fields of an address', () => {
      useUserStore.getState().setUser(sampleUser as never);
      useUserStore.getState().addAddress({ street: 'Calle Vieja', city: 'Santiago' } as never);
      const addressId = useUserStore.getState().user!.addresses![0].id;

      useUserStore.getState().updateAddress(addressId, { city: 'ValparaÃ­so' } as never);

      const updated = useUserStore.getState().user?.addresses?.find((a) => a.id === addressId);
      expect(updated?.city).toBe('ValparaÃ­so');
      expect((updated as never as { street: string })?.street).toBe('Calle Vieja');
    });
  });
});
