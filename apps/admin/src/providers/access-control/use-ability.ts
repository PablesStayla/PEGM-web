/**
 * Client hook for imperative ability checks.
 *
 *   const ability = useAbility();
 *   if (ability.can('update', 'Pricing')) { ... }
 *
 * Throws when used outside `<AbilityProvider>` to surface integration mistakes
 * at runtime instead of silently denying access.
 *
 * @module providers/access-control/use-ability
 */

'use client';

import { useContext } from 'react';
import type { AppAbility } from './ability';
import { AbilityContext } from './can';

export function useAbility(): AppAbility {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error(
      '[access-control] useAbility() called outside <AbilityProvider>. ' +
        'Wrap your tree in providers/providers.tsx.',
    );
  }
  return ability;
}
