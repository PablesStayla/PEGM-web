/**
 * Sidebar layout configuration.
 *
 * Builds groups of links from `resources.config.ts`. Decoupled so that the
 * sidebar order can be tweaked for UX without touching the resource registry.
 *
 * @module config/nav.config
 */

import { type AdminResource, resources } from './resources.config';

export interface NavGroup {
  readonly id: AdminResource['group'];
  readonly label: string;
  readonly resources: readonly AdminResource[];
}

const GROUP_LABELS: Record<AdminResource['group'], string> = {
  core: 'Operación diaria',
  commerce: 'Comercio',
  operations: 'Operaciones',
  system: 'Sistema',
};

const GROUP_ORDER: readonly AdminResource['group'][] = [
  'system', // Dashboard first
  'core',
  'commerce',
  'operations',
];

export const navGroups: readonly NavGroup[] = GROUP_ORDER.map((group) => ({
  id: group,
  label: GROUP_LABELS[group],
  resources: resources.filter((r) => r.group === group),
}));
