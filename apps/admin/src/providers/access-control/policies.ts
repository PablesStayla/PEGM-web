/**
 * Role-Based Access Control policies.
 *
 * Single source of truth for "who can do what". Reads cleanly enough to be
 * copy-pasted into a security audit document.
 *
 * Granular field-level rules use CASL's `conditions` arg (e.g. `cannot('update',
 * 'Pricing', ['vat'])` blocks updates that touch the VAT field).
 *
 * @module providers/access-control/policies
 */

import { AbilityBuilder } from '@casl/ability';
import type { SessionUser } from '@/providers/auth';
import { type Action, AppAbility, type Subject } from './ability';

export function defineAbilitiesFor(user: SessionUser | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);

  if (!user) {
    return build();
  }

  switch (user.role) {
    case 'superadmin': {
      can('manage', 'all');
      break;
    }

    case 'admin': {
      can('manage', [
        'Inventory',
        'Supplier',
        'Pricing',
        'Order',
        'Product',
        'Customer',
        'CmsPage',
        'Analytics',
        'Dashboard',
      ]);
      can('read', 'Settings');
      can(['read', 'update'], 'Monitoring');
      can(['read', 'update'], 'Automation');
      // Refunds and overrides require explicit superadmin approval.
      cannot(['refund', 'override'], 'Order');
      break;
    }

    case 'operator': {
      can(['read', 'update'], 'Inventory');
      can('scrape', 'Inventory');
      can('read', 'Supplier');
      can(['read', 'update'], 'Order');
      cannot('refund', 'Order');
      can('read', 'Product');
      can('read', 'Pricing');
      // Operator can read margins but NEVER edit VAT.
      cannot('update', 'Pricing');
      can('read', 'Dashboard');
      break;
    }

    case 'finance': {
      can('manage', 'Pricing');
      can(['read', 'export'], 'Order');
      can('refund', 'Order');
      can('read', 'Supplier');
      can(['read', 'export'], 'Analytics');
      can('read', 'Dashboard');
      break;
    }

    case 'viewer': {
      can('read', [
        'Dashboard',
        'Inventory',
        'Supplier',
        'Pricing',
        'Order',
        'Product',
        'Customer',
        'Analytics',
      ]);
      break;
    }
  }

  return build();
}

/** Lightweight serialisable rules for client hydration via `<AbilityProvider>`. */
export type SerialisedAbility = {
  rules: AppAbility['rules'];
};

export function serialiseAbility(ability: AppAbility): SerialisedAbility {
  return { rules: ability.rules };
}

export function hydrateAbility(serialised: SerialisedAbility): AppAbility {
  return new AppAbility(serialised.rules);
}

export type { Action, Subject };
