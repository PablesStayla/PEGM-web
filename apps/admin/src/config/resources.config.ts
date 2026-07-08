/**
 * Single source of truth for every admin resource (bounded context).
 *
 * Sidebar, breadcrumbs, command palette, RBAC middleware and `<Can>` gates all
 * read from this list. Adding a new resource is a one-line change here plus
 * the corresponding `resources/<name>/` folder.
 *
 * @module config/resources.config
 */

import {
  Activity,
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Truck,
  Users,
  Workflow,
} from 'lucide-react';
import type { Subject } from '@/providers/access-control';
import type { ResourceName } from '@/providers/data';

export interface ResourceConfig {
  /** Stable id, must match `ResourceName` and `resources/<name>/` folder. */
  readonly name: ResourceName;
  /** Human-readable label for sidebar / breadcrumbs (Spanish — primary locale). */
  readonly label: string;
  /** Section in the sidebar — matches `nav.config.ts` groups. */
  readonly group: 'core' | 'commerce' | 'operations' | 'system';
  /** Base URL inside `(dashboard)/`. */
  readonly path: string;
  /** Icon shown in the sidebar / command palette. */
  readonly icon: LucideIcon;
  /** CASL subject used by the middleware to gate the route. */
  readonly subject: Subject;
  /** Default minimum action required just to *see* the resource. */
  readonly minAction: 'read' | 'manage';
  /** Optional short description for command palette and empty states. */
  readonly description?: string;
}

export const resources = [
  // ---- Core (Screaming Architecture front-and-center) ---------------------
  {
    name: 'inventory',
    label: 'Inventario',
    group: 'core',
    path: '/inventory',
    icon: Boxes,
    subject: 'Inventory',
    minAction: 'read',
    description: 'Stock, scrapers de proveedores y reabastecimiento.',
  },
  {
    name: 'supplier',
    label: 'Proveedores',
    group: 'core',
    path: '/suppliers',
    icon: Truck,
    subject: 'Supplier',
    minAction: 'read',
    description: 'Gestión de proveedores y órdenes de compra.',
  },
  {
    name: 'pricing',
    label: 'Precios y Márgenes',
    group: 'core',
    path: '/pricing',
    icon: Tag,
    subject: 'Pricing',
    minAction: 'read',
    description: 'Tableros de control de márgenes, IVA y descuentos.',
  },
  {
    name: 'orders',
    label: 'Órdenes',
    group: 'core',
    path: '/orders',
    icon: ShoppingBag,
    subject: 'Order',
    minAction: 'read',
    description: 'Ventas, fulfilment y dropshipping.',
  },
  {
    name: 'products',
    label: 'Productos',
    group: 'core',
    path: '/products',
    icon: Package,
    subject: 'Product',
    minAction: 'read',
    description: 'Catálogo de productos publicados.',
  },

  // ---- Commerce -----------------------------------------------------------
  {
    name: 'customers',
    label: 'Clientes',
    group: 'commerce',
    path: '/customers',
    icon: Users,
    subject: 'Customer',
    minAction: 'read',
    description: 'Base de clientes y segmentación.',
  },
  {
    name: 'cms',
    label: 'CMS',
    group: 'commerce',
    path: '/cms',
    icon: FileText,
    subject: 'CmsPage',
    minAction: 'read',
    description: 'Páginas, contenido y live commerce.',
  },
  {
    name: 'analytics',
    label: 'Analítica',
    group: 'commerce',
    path: '/analytics',
    icon: BarChart3,
    subject: 'Analytics',
    minAction: 'read',
    description: 'Reportes, embudos y rentabilidad.',
  },

  // ---- Operations ---------------------------------------------------------
  {
    name: 'automation',
    label: 'Automatización',
    group: 'operations',
    path: '/automation',
    icon: Workflow,
    subject: 'Automation',
    minAction: 'read',
    description: 'Workflows, eventos y sagas.',
  },
  {
    name: 'monitoring',
    label: 'Monitoring',
    group: 'operations',
    path: '/monitoring',
    icon: Activity,
    subject: 'Monitoring',
    minAction: 'read',
    description: 'Health, logs, webhooks y auditoría.',
  },

  // ---- System -------------------------------------------------------------
  {
    name: 'dashboard',
    label: 'Dashboard',
    group: 'system',
    path: '/',
    icon: LayoutDashboard,
    subject: 'Dashboard',
    minAction: 'read',
    description: 'Vista general con KPIs y alertas.',
  },
  {
    name: 'settings',
    label: 'Configuración',
    group: 'system',
    path: '/settings',
    icon: Settings,
    subject: 'Settings',
    minAction: 'read',
    description: 'Ajustes globales, feature flags, integraciones.',
  },
] as const satisfies readonly ResourceConfig[];

export type AdminResource = (typeof resources)[number];

/** O(1) lookup helpers used by middleware, command palette, breadcrumbs. */
export const resourceByName = new Map<ResourceName, ResourceConfig>(
  resources.map((r) => [r.name, r]),
);

export function findResourceByPath(pathname: string): ResourceConfig | undefined {
  // Most specific path wins ("/orders/[id]" matches "/orders" config).
  const sorted = [...resources].sort((a, b) => b.path.length - a.path.length);
  return sorted.find((r) => (r.path === '/' ? pathname === '/' : pathname.startsWith(r.path)));
}
