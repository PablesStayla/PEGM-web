/**
 * Client Component that hydrates the CASL ability from a serialised
 * representation passed by the Server Component `<AdminProviders>`.
 *
 * Kept in its own file because mixing `'use client'` with async Server
 * Components in the same module breaks the React Server Components compiler.
 *
 * @module providers/client-ability-boundary
 */

'use client';

import { type ReactNode, useMemo } from 'react';
import {
  AbilityProvider,
  hydrateAbility,
  type SerialisedAbility,
} from '@/providers/access-control';

export function ClientAbilityBoundary({
  serialised,
  children,
}: {
  serialised: SerialisedAbility;
  children: ReactNode;
}) {
  // useMemo so the AppAbility instance is stable across re-renders — CASL
  // memoises rule lookups internally and benefits from referential equality.
  const ability = useMemo(() => hydrateAbility(serialised), [serialised]);
  return <AbilityProvider ability={ability}>{children}</AbilityProvider>;
}
