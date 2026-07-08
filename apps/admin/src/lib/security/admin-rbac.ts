import type { User } from '@supabase/supabase-js';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from './audit';

type AdminPermissionAction = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'export';

type AdminPermissionResource =
  | 'orders'
  | 'products'
  | 'inventory'
  | 'suppliers'
  | 'dropship_orders'
  | 'settings'
  | 'security'
  | 'analytics'
  | 'customers'
  | 'cms'
  | 'all';

type AdminRole = 'superadmin' | 'admin';

type AdminUserLike = Pick<User, 'id'> & {
  user_metadata?: Record<string, unknown> | null;
};

type PermissionMap = Partial<Record<AdminPermissionResource, readonly AdminPermissionAction[]>>;

const ROLE_ALIASES: Record<string, AdminRole> = {
  super_admin: 'superadmin',
  superadmin: 'superadmin',
  owner: 'superadmin',
  admin: 'admin',
};

const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, PermissionMap> = {
  superadmin: {
    all: ['manage'],
  },
  admin: {
    orders: ['manage', 'export'],
    products: ['manage'],
    inventory: ['manage'],
    suppliers: ['read', 'create', 'update'],
    dropship_orders: ['read', 'update'],
    settings: ['read'],
    security: ['read', 'update'],
    analytics: ['read', 'export'],
    customers: ['read', 'update'],
    cms: ['manage'],
  },
};

function hasActionPermission(
  allowedActions: readonly AdminPermissionAction[] | undefined,
  requestedAction: AdminPermissionAction,
): boolean {
  if (!allowedActions || allowedActions.length === 0) {
    return false;
  }

  return allowedActions.includes('manage') || allowedActions.includes(requestedAction);
}

/**
 * Resolves role from metadata. Fallback to `admin` keeps compatibility for mocked test contexts
 * while runtime access remains protected by requireAdmin in safe-action middleware.
 */
export function getAdminRoleFromUser(user: AdminUserLike | null): AdminRole {
  const rawRole = user?.user_metadata?.role;

  if (typeof rawRole !== 'string') {
    return 'admin';
  }

  return ROLE_ALIASES[rawRole.toLowerCase()] ?? 'admin';
}

export function canAdminPerform(params: {
  role: AdminRole;
  resource: AdminPermissionResource;
  action: AdminPermissionAction;
}): boolean {
  const { role, resource, action } = params;
  const rolePermissions = ADMIN_ROLE_PERMISSIONS[role];

  return (
    hasActionPermission(rolePermissions.all, action) ||
    hasActionPermission(rolePermissions[resource], action)
  );
}

export async function requireAdminPermission(params: {
  user: AdminUserLike;
  resource: AdminPermissionResource;
  action: AdminPermissionAction;
  metadata?: Record<string, unknown>;
}): Promise<{ role: AdminRole }> {
  const { user, resource, action, metadata } = params;
  const role = getAdminRoleFromUser(user);

  if (canAdminPerform({ role, resource, action })) {
    return { role };
  }

  await logAdminAuditEvent({
    eventType: ADMIN_AUDIT_EVENTS.RBAC_ACCESS_DENIED,
    severity: 'warning',
    userId: user.id,
    resource,
    action: `${action}_${resource}_denied`,
    metadata: {
      role,
      requiredAction: action,
      requiredResource: resource,
      ...metadata,
    },
  });

  throw new Error(`Forbidden: missing permission ${action} on ${resource}`);
}
