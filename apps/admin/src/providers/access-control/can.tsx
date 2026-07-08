/**
 * `<Can>` and `<Cannot>` components — declarative permission gates for the UI.
 *
 *   <Can I="update" a="Pricing">
 *     <EditVatButton />
 *   </Can>
 *
 * Works in both Server Components (where the ability is built from the
 * server-side session) and Client Components (where it comes from the
 * `AbilityContext`). The API is identical.
 *
 * @module providers/access-control/can
 */

'use client';

import { createContextualCan } from '@casl/react';
import { createContext, type ReactNode, useContext } from 'react';
import type { AppAbility } from './ability';
import type { Action, Subject } from './policies';

export const AbilityContext = createContext<AppAbility>(null as any);

/**
 * `<Can I="update" a="Pricing">…</Can>`. CASL's `createContextualCan` returns a
 * component bound to our `AbilityContext`.
 */
export const Can = createContextualCan<AppAbility>(AbilityContext.Consumer);

/** Inverse helper for "show fallback when forbidden". */
export function Cannot({
  I: action,
  a: subject,
  children,
}: {
  I: Action;
  a: Subject;
  children: ReactNode;
}) {
  const ability = useContext(AbilityContext);
  if (!ability) {
    return null;
  }
  return ability.cannot(action, subject) ? children : null;
}

export function AbilityProvider({
  ability,
  children,
}: {
  ability: AppAbility;
  children: ReactNode;
}) {
  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
