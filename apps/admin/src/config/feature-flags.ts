/**
 * Static feature flags consumed by the admin UI.
 *
 * Read from environment variables at build time so they tree-shake away in
 * production. For runtime / per-user flags use PostHog (see
 * `packages/infrastructure/feature-flags`).
 *
 * @module config/feature-flags
 */

export const featureFlags = {
  /** Render the new ResourceTable in the orders list (gradual rollout). */
  ordersTableV2: process.env.NEXT_PUBLIC_FF_ORDERS_TABLE_V2 === 'true',
  /** Show the live-commerce CMS section. */
  liveCommerce: process.env.NEXT_PUBLIC_FF_LIVE_COMMERCE === 'true',
  /** Enable the experimental margin calculator under /pricing/calculator. */
  marginCalculator: process.env.NEXT_PUBLIC_FF_MARGIN_CALC !== 'false',
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
