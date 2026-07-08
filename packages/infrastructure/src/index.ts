/**
 * @pranakaia/infrastructure — Infrastructure Layer
 *
 * Consolidated screaming architecture package containing database repositories,
 * payment gateways, authentication shims, and application bootstrapping.
 */

// ── Shared Kernel exports ──
export type { DomainError, Entity, Result, ValueObject } from '@pranakaia/shared-kernel';
export { AuditService } from '@pranakaia/shared-kernel';
// ── Auth Client exports ──
export { createClient as createSupabaseClient } from './auth/server';
// ── Application Bootstrapping ──
export { type BackendConfig, BackendModule } from './backend.module';
// ── Payment Gateways ──
export { type FlowGatewayConfig, FlowPaymentGateway } from './gateways/flow-payment-gateway';
export { type StripeGatewayConfig, StripePaymentGateway } from './gateways/stripe-payment-gateway';
export { DrizzleInventoryRepository } from './repositories/drizzle-inventory-repository';
// ── Repositories ──
export { DrizzleOrderRepository } from './repositories/drizzle-order-repository';
export { DrizzleProductCatalog } from './repositories/drizzle-product-catalog';
export { DrizzleProductRepository } from './repositories/drizzle-product-repository';
export { DrizzleShippingRepository } from './repositories/drizzle-shipping-repository';
export { DrizzleWebhookLogRepository } from './repositories/drizzle-webhook-log-repository';

// Marker to ensure proper CJS/ESM dual package
const __infrastructure_stub = true;

export { __infrastructure_stub };
