import { describe, expect, it, vi } from 'vitest';

vi.mock('./audit', () => ({
  ADMIN_AUDIT_EVENTS: {
    RBAC_ACCESS_DENIED: 'admin_rbac_access_denied',
  },
  logAdminAuditEvent: vi.fn(),
}));

import { canAdminPerform, getAdminRoleFromUser } from './admin-rbac';

describe('admin-rbac role normalization', () => {
  it('maps SUPER_ADMIN metadata to superadmin role', () => {
    const role = getAdminRoleFromUser({
      id: 'user-1',
      user_metadata: { role: 'SUPER_ADMIN' },
    });

    expect(role).toBe('superadmin');
  });

  it('maps ADMIN metadata to admin role', () => {
    const role = getAdminRoleFromUser({
      id: 'user-1',
      user_metadata: { role: 'ADMIN' },
    });

    expect(role).toBe('admin');
  });

  it('falls back to admin when metadata is unavailable', () => {
    const role = getAdminRoleFromUser({ id: 'user-1' });

    expect(role).toBe('admin');
  });
});

describe('admin-rbac permissions', () => {
  it('allows superadmin to manage settings', () => {
    expect(
      canAdminPerform({
        role: 'superadmin',
        resource: 'settings',
        action: 'update',
      }),
    ).toBe(true);
  });

  it('prevents admin from updating settings', () => {
    expect(
      canAdminPerform({
        role: 'admin',
        resource: 'settings',
        action: 'update',
      }),
    ).toBe(false);
  });

  it('allows admin to export orders', () => {
    expect(
      canAdminPerform({
        role: 'admin',
        resource: 'orders',
        action: 'export',
      }),
    ).toBe(true);
  });
});
