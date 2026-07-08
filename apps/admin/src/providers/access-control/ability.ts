/**
 * CASL Ability — typed contract for what each role can do.
 *
 * Subjects map 1:1 to bounded contexts (resources). Actions cover the standard
 * CRUD plus domain-specific verbs (`export`, `approve`, `refund`, `scrape`).
 *
 * The registry is intentionally lean here; granular rules (e.g. "operator
 * cannot edit `pricing.vat`") live in `policies.ts`, where they are co-located
 * with the role definitions for easy auditing.
 *
 * @module providers/access-control/ability
 */

import { type AbilityClass, PureAbility } from '@casl/ability';

export type Action =
  | 'manage' // wildcard
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'approve'
  | 'refund'
  | 'scrape'
  | 'override';

export type Subject =
  | 'Inventory'
  | 'Supplier'
  | 'Pricing'
  | 'Order'
  | 'Product'
  | 'Customer'
  | 'CmsPage'
  | 'Analytics'
  | 'Automation'
  | 'Monitoring'
  | 'Settings'
  | 'Dashboard'
  | 'all';

export type AppAbility = PureAbility<[Action, Subject]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;
