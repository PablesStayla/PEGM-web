/**
 * User Role Value Object — defines authorization levels.
 *
 * @example
 * ```ts
 * const role = UserRole.ADMIN;
 * if (UserRoleHelper.canAccessAdmin(role)) { /* grant access *\/ }
 * ```
 */
export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Helper functions for user role authorization checks.
 *
 * @example
 * ```ts
 * UserRoleHelper.isAdmin(UserRole.ADMIN);        // true
 * UserRoleHelper.canManageUsers(UserRole.CUSTOMER); // false
 * ```
 */
export const UserRoleHelper = {
  /** Returns true for ADMIN or SUPER_ADMIN roles. */
  isAdmin: (role: UserRole): boolean => role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN,
  /** Returns true if the role can manage other users. */
  canManageUsers: (role: UserRole): boolean =>
    role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN,
  /** Returns true if the role can access the admin panel. */
  canAccessAdmin: (role: UserRole): boolean =>
    role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN,
};
