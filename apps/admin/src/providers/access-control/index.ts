/**
 * Public surface of the Access Control layer.
 *
 *   import { defineAbilitiesFor, Can, useAbility } from '@/providers/access-control';
 */

export type { Action, AppAbility, Subject } from './ability';
export { AppAbility as AppAbilityClass } from './ability';
export { AbilityProvider, Can, Cannot } from './can';
export {
  defineAbilitiesFor,
  hydrateAbility,
  type SerialisedAbility,
  serialiseAbility,
} from './policies';
export { useAbility } from './use-ability';
