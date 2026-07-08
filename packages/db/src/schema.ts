import { randomUUID } from 'node:crypto';
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

// -- Multi-tenancy Enums & Tables --------------------------------------------

export const tenants = pgTable('tenants', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain').unique(),
  plan: text('plan').default('STARTER').notNull(),
  status: text('status').default('ACTIVE').notNull(),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const stores = pgTable(
  'stores',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: text('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    domain: text('domain').unique(),
    settings: jsonb('settings'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('stores_tenant_id_idx').on(t.tenantId)],
);

// -- Enums -------------------------------------------------------------------

export const roleEnum = pgEnum('Role', ['USER', 'ADMIN', 'SUPER_ADMIN']);

export const orderStatusEnum = pgEnum('OrderStatus', [
  'PENDING',
  'PAID',
  'PROCESSING',
  'FULFILLING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'FAILED',
]);

export const productStatusEnum = pgEnum('ProductStatus', [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'OUT_OF_STOCK',
]);

export const paymentStatusEnum = pgEnum('PaymentStatus', [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);

export const dropshipStatusEnum = pgEnum('DropshipStatus', [
  'PENDING',
  'PROCESSING',
  'SUBMITTED',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
  'RETURNED',
]);

export const auditSeverityEnum = pgEnum('AuditSeverity', ['info', 'warning', 'error', 'critical']);

export const couponTypeEnum = pgEnum('CouponType', ['percentage', 'fixed', 'free_shipping']);

// -- Users & Sessions --------------------------------------------------------

export const usersTable = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    name: text('name'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phone: text('phone'),
    avatar: text('avatar'),
    role: roleEnum('role').default('USER').notNull(),
    status: text('status').default('ACTIVE').notNull(),
    isEmailVerified: boolean('is_email_verified').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    tenantId: text('tenant_id'),
    storeId: text('store_id'),
    lastLoginAt: timestamp('last_login_at'),
    lastLogin: timestamp('last_login'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('users_tenant_id_idx').on(t.tenantId),
    index('users_store_id_idx').on(t.storeId),
    index('users_role_idx').on(t.role),
  ],
);

export const users = usersTable;

export const sessionsTable = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = sessionsTable;

// -- Audit Logs --------------------------------------------------------------

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    severity: auditSeverityEnum('severity').default('info').notNull(),
    userId: text('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
    oldData: jsonb('old_data'),
    newData: jsonb('new_data'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('audit_logs_action_idx').on(t.action),
    index('audit_logs_entity_idx').on(t.entityType, t.entityId),
    index('audit_logs_user_id_idx').on(t.userId),
    index('audit_logs_created_at_idx').on(t.createdAt),
  ],
);

export const addresses = pgTable(
  'addresses',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    street: text('street').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    postalCode: text('postal_code').notNull(),
    country: text('country').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('addresses_user_id_idx').on(t.userId)],
);

// -- Customers ---------------------------------------------------------------

export const customers = pgTable(
  'customers',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    email: text('email').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phone: text('phone'),
    tenantId: text('tenant_id').references(() => tenants.id),
    storeId: text('store_id').references(() => stores.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('customers_tenant_id_idx').on(t.tenantId),
    index('customers_store_id_idx').on(t.storeId),
    index('customers_email_idx').on(t.email),
  ],
);

// -- Catalog -----------------------------------------------------------------

export const categoriesTable = pgTable(
  'categories',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    parentId: text('parent_id'),
    tenantId: text('tenant_id'),
    storeId: text('store_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('categories_tenant_id_idx').on(t.tenantId),
    index('categories_parent_id_idx').on(t.parentId),
  ],
);

export const categories = categoriesTable;

export const productsTable = pgTable(
  'products',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    sku: text('sku').notNull().unique(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    shortDescription: text('short_description'),
    basePrice: numeric('base_price', { precision: 12, scale: 2 }).notNull(),
    salePrice: numeric('sale_price', { precision: 12, scale: 2 }),
    costPrice: numeric('cost_price', { precision: 12, scale: 2 }),
    stockQuantity: integer('stock_quantity').default(0).notNull(),
    lowStockThreshold: integer('low_stock_threshold').default(5),
    status: text('status').notNull().default('DRAFT'),
    isFeatured: boolean('is_featured').default(false).notNull(),
    categoryId: text('category_id').references(() => categoriesTable.id),
    tenantId: text('tenant_id'),
    storeId: text('store_id'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('products_category_id_idx').on(t.categoryId),
    index('products_tenant_id_idx').on(t.tenantId),
    index('products_store_id_idx').on(t.storeId),
    index('products_status_idx').on(t.status),
    index('products_is_featured_idx').on(t.isFeatured),
  ],
);

export const products = productsTable;

export const productImagesTable = pgTable(
  'product_images',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    productId: text('product_id')
      .references(() => productsTable.id, { onDelete: 'cascade' })
      .notNull(),
    url: text('url').notNull(),
    altText: text('alt_text'),
    isMain: boolean('is_main').default(false).notNull(),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('product_images_product_id_idx').on(t.productId)],
);

export const productImages = productImagesTable;

export const productVariants = pgTable(
  'product_variants',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    productId: text('product_id')
      .references(() => productsTable.id, { onDelete: 'cascade' })
      .notNull(),
    sku: text('sku').notNull().unique(),
    name: text('name').notNull(),
    priceLimit: numeric('price_limit', { precision: 12, scale: 2 }),
    inventoryQty: integer('inventory_qty').default(0).notNull(),
    attributes: jsonb('attributes').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('product_variants_product_id_idx').on(t.productId)],
);

// -- Orders & Checkout -------------------------------------------------------

export const ordersTable = pgTable(
  'orders',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    orderNumber: text('order_number').notNull().unique(),
    userId: text('user_id').references(() => usersTable.id),
    guestEmail: text('guest_email'),
    status: text('status').notNull().default('PENDING'),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }),
    taxTotal: numeric('tax_total', { precision: 12, scale: 2 }),
    shippingTotal: numeric('shipping_total', { precision: 12, scale: 2 }),
    total: numeric('total', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').default('CLP').notNull(),
    paymentStatus: text('payment_status').notNull().default('PENDING'),
    stripeSessionId: text('stripe_session_id'),
    flowOrderId: text('flow_order_id'),
    externalPaymentId: text('external_payment_id'),
    providerOrderId: text('provider_order_id'),
    shippingAddressId: text('shipping_address_id').references(() => addresses.id),
    billingAddressId: text('billing_address_id').references(() => addresses.id),
    notes: text('notes'),
    trackingNumber: text('tracking_number'),
    trackingUrl: text('tracking_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('orders_user_id_idx').on(t.userId),
    index('orders_status_idx').on(t.status),
    index('orders_payment_status_idx').on(t.paymentStatus),
    index('orders_created_at_idx').on(t.createdAt),
  ],
);

export const orders = ordersTable;

export const orderItemsTable = pgTable(
  'order_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    orderId: text('order_id')
      .references(() => ordersTable.id, { onDelete: 'cascade' })
      .notNull(),
    productId: text('product_id')
      .references(() => productsTable.id)
      .notNull(),
    variantId: text('variant_id').references(() => productVariants.id),
    quantity: integer('quantity').notNull(),
    unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  },
  (t) => [
    index('order_items_order_id_idx').on(t.orderId),
    index('order_items_product_id_idx').on(t.productId),
  ],
);

export const orderItems = orderItemsTable;

// -- Cart --------------------------------------------------------------------

export const cartsTable = pgTable(
  'carts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
    customerId: text('customer_id').references(() => usersTable.id, { onDelete: 'set null' }),
    sessionId: text('session_id'),
    status: text('status').default('active').notNull(),
    currency: text('currency').default('CLP').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
  },
  (t) => [index('carts_user_id_idx').on(t.userId), index('carts_session_id_idx').on(t.sessionId)],
);

export const carts = cartsTable;

export const cartItemsTable = pgTable(
  'cart_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    cartId: text('cart_id')
      .references(() => cartsTable.id, { onDelete: 'cascade' })
      .notNull(),
    productId: text('product_id')
      .references(() => productsTable.id, { onDelete: 'cascade' })
      .notNull(),
    variantId: text('variant_id').references(() => productVariants.id),
    sku: text('sku'),
    name: text('name'),
    imageUrl: text('image_url'),
    quantity: integer('quantity').notNull().default(1),
    unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('cart_items_cart_id_idx').on(t.cartId),
    index('cart_items_product_id_idx').on(t.productId),
  ],
);

export const cartItems = cartItemsTable;

// -- Newsletter Subscribers --------------------------------------------------

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  email: text('email').notNull().unique(),
  acceptsMarketing: boolean('accepts_marketing').default(true).notNull(),
  status: text('status').default('active').notNull(),
  source: text('source').default('website'),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at'),
});

// -- Product Reviews ---------------------------------------------------------

export const productReviews = pgTable(
  'product_reviews',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    productId: text('product_id')
      .references(() => productsTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
    authorName: text('author_name').notNull(),
    rating: integer('rating').notNull(),
    title: text('title'),
    body: text('body'),
    isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
    isApproved: boolean('is_approved').default(false).notNull(),
    helpfulCount: integer('helpful_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('product_reviews_product_id_idx').on(t.productId),
    index('product_reviews_user_id_idx').on(t.userId),
    index('product_reviews_rating_idx').on(t.rating),
  ],
);

// -- Payments ----------------------------------------------------------------

export const payments = pgTable(
  'payments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    orderId: text('order_id')
      .references(() => ordersTable.id, { onDelete: 'cascade' })
      .notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').default('CLP').notNull(),
    provider: text('provider').notNull(),
    providerId: text('provider_id').notNull(),
    status: paymentStatusEnum('status').default('PENDING').notNull(),
    providerData: jsonb('provider_data'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('payments_order_id_idx').on(t.orderId), index('payments_status_idx').on(t.status)],
);

// -- Dropship Orders ---------------------------------------------------------

export const dropshipOrders = pgTable(
  'dropship_orders',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: text('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    orderId: text('order_id')
      .references(() => ordersTable.id, { onDelete: 'cascade' })
      .notNull(),
    orderItemId: text('order_item_id').notNull(),
    supplierId: text('supplier_id').notNull(),
    supplierProductId: text('supplier_product_id').notNull(),
    productId: text('product_id')
      .references(() => productsTable.id)
      .notNull(),
    quantity: integer('quantity').notNull(),
    unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).notNull(),
    totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull(),
    shippingAddress: jsonb('shipping_address'),
    status: dropshipStatusEnum('status').default('PENDING').notNull(),
    supplierOrderId: text('supplier_order_id'),
    trackingNumber: text('tracking_number'),
    carrier: text('carrier'),
    notes: text('notes'),
    autoSubmit: boolean('auto_submit').default(false).notNull(),
    submittedAt: timestamp('submitted_at'),
    shippedAt: timestamp('shipped_at'),
    deliveredAt: timestamp('delivered_at'),
    cancelledAt: timestamp('cancelled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('dropship_orders_tenant_id_idx').on(t.tenantId),
    index('dropship_orders_order_id_idx').on(t.orderId),
    index('dropship_orders_product_id_idx').on(t.productId),
    index('dropship_orders_status_idx').on(t.status),
  ],
);

// -- Webhook Logs ------------------------------------------------------------

export const webhookSourceEnum = pgEnum('WebhookSource', ['payments', 'supplier', 'internal']);

export const webhookStatusEnum = pgEnum('WebhookStatus', [
  'RECEIVED',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
]);

export const webhookLogs = pgTable(
  'webhook_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    source: webhookSourceEnum('source').notNull(),
    event: text('event').notNull(),
    payload: jsonb('payload').notNull(),
    headers: jsonb('headers'),
    status: webhookStatusEnum('status').default('RECEIVED').notNull(),
    attempts: integer('attempts').default(0).notNull(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
  },
  (t) => [
    index('webhook_logs_source_idx').on(t.source),
    index('webhook_logs_status_idx').on(t.status),
    index('webhook_logs_event_idx').on(t.event),
    index('webhook_logs_created_at_idx').on(t.createdAt),
  ],
);

// -- Outbox Messages ---------------------------------------------------------

export const outboxStatusEnum = pgEnum('OutboxStatus', [
  'pending',
  'processing',
  'sent',
  'failed',
  'dead_letter',
]);

export const outboxMessages = pgTable(
  'outbox_messages',
  {
    id: text('id').primaryKey(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').notNull(),
    headers: jsonb('headers').notNull(),
    status: outboxStatusEnum('status').default('pending').notNull(),
    retryCount: integer('retry_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastAttemptAt: timestamp('last_attempt_at'),
    processedAt: timestamp('processed_at'),
    lastError: text('last_error'),
  },
  (t) => [
    index('outbox_messages_status_idx').on(t.status),
    index('outbox_messages_created_at_idx').on(t.createdAt),
    index('outbox_messages_retry_count_idx').on(t.retryCount),
    index('outbox_messages_last_attempt_at_idx').on(t.lastAttemptAt),
  ],
);

// -- Shipping Zones & Rates --------------------------------------------------

export const shippingZones = pgTable('shipping_zones', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  regions: jsonb('regions').notNull().$type<string[]>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const shippingRates = pgTable(
  'shipping_rates',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    zoneId: text('zone_id')
      .references(() => shippingZones.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    minWeight: numeric('min_weight', { precision: 10, scale: 2 }).default('0'),
    maxWeight: numeric('max_weight', { precision: 10, scale: 2 }),
    minOrderValue: numeric('min_order_value', { precision: 10, scale: 2 }).default('0'),
    maxOrderValue: numeric('max_order_value', { precision: 10, scale: 2 }),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    isFree: boolean('is_free').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('shipping_rates_zone_id_idx').on(t.zoneId)],
);

// -- Inventory ---------------------------------------------------------------

export const inventory = pgTable(
  'inventory',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    productId: text('product_id')
      .references(() => productsTable.id, { onDelete: 'cascade' })
      .notNull(),
    sku: text('sku').notNull().unique(),
    quantity: integer('quantity').default(0).notNull(),
    reservedQuantity: integer('reserved_quantity').default(0).notNull(),
    lowStockThreshold: integer('low_stock_threshold').default(10),
    reorderPoint: integer('reorder_point').default(20),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('inventory_product_id_idx').on(t.productId)],
);

// -- Coupons -----------------------------------------------------------------

export const coupons = pgTable(
  'coupons',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    type: couponTypeEnum('type').notNull(),
    value: numeric('value', { precision: 12, scale: 2 }).notNull(),
    minAmount: numeric('min_amount', { precision: 12, scale: 2 }),
    maxDiscount: numeric('max_discount', { precision: 12, scale: 2 }),
    usageLimit: integer('usage_limit'),
    usageCount: integer('usage_count').default(0).notNull(),
    perCustomerLimit: integer('per_customer_limit'),
    startsAt: timestamp('starts_at').notNull(),
    expiresAt: timestamp('expires_at'),
    isActive: boolean('is_active').default(true).notNull(),
    createdBy: text('created_by').references(() => usersTable.id, { onDelete: 'set null' }),
    updatedBy: text('updated_by').references(() => usersTable.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('coupons_code_idx').on(t.code),
    index('coupons_is_active_idx').on(t.isActive),
    index('coupons_starts_at_idx').on(t.startsAt),
    index('coupons_expires_at_idx').on(t.expiresAt),
  ],
);

export const couponRedemptions = pgTable(
  'coupon_redemptions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    couponId: text('coupon_id')
      .references(() => coupons.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
    orderId: text('order_id').references(() => ordersTable.id, { onDelete: 'set null' }),
    discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').default('CLP').notNull(),
    metadata: jsonb('metadata'),
    redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
  },
  (t) => [
    index('coupon_redemptions_coupon_id_idx').on(t.couponId),
    index('coupon_redemptions_user_id_idx').on(t.userId),
    index('coupon_redemptions_order_id_idx').on(t.orderId),
    index('coupon_redemptions_redeemed_at_idx').on(t.redeemedAt),
    unique('coupon_redemptions_coupon_order_unique').on(t.couponId, t.orderId),
  ],
);

// -- Wishlists & Reviews & Review Votes --------------------------------------

export const wishlists = pgTable(
  'wishlists',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    productId: text('product_id')
      .references(() => productsTable.id, { onDelete: 'cascade' })
      .notNull(),
    variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('wishlists_user_id_idx').on(t.userId),
    index('wishlists_product_id_idx').on(t.productId),
    unique('unique_wishlist').on(t.userId, t.productId, t.variantId),
  ],
);

export const reviews = pgTable(
  'reviews',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    productId: text('product_id')
      .references(() => productsTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    rating: integer('rating').notNull(),
    title: text('title'),
    content: text('content'),
    isVerifiedPurchase: boolean('is_verified_purchase').default(false),
    status: text('status').default('pending').notNull(),
    helpfulCount: integer('helpful_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('reviews_product_id_idx').on(t.productId),
    index('reviews_user_id_idx').on(t.userId),
    index('reviews_rating_idx').on(t.rating),
    index('reviews_status_idx').on(t.status),
  ],
);

export const reviewVotes = pgTable(
  'review_votes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    reviewId: text('review_id')
      .references(() => reviews.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    isHelpful: boolean('is_helpful').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('review_votes_review_id_idx').on(t.reviewId),
    index('review_votes_user_id_idx').on(t.userId),
    unique('unique_vote').on(t.reviewId, t.userId),
  ],
);

export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    id: text('id').primaryKey(),
    status: text('status').notNull(),
    response: jsonb('response'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('idempotency_keys_status_idx').on(t.status)],
);

// -- Types -------------------------------------------------------------------

export type UserSelect = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;
export type SessionSelect = typeof sessionsTable.$inferSelect;
export type SessionInsert = typeof sessionsTable.$inferInsert;
export type CartSelect = typeof cartsTable.$inferSelect;
export type CartInsert = typeof cartsTable.$inferInsert;
export type CartItemSelect = typeof cartItemsTable.$inferSelect;
export type CartItemInsert = typeof cartItemsTable.$inferInsert;

// -- Relations Definitions ---------------------------------------------------

export const cartsRelations = relations(cartsTable, ({ many }) => ({
  items: many(cartItemsTable),
}));

export const cartItemRelations = relations(cartItemsTable, ({ one }) => ({
  cart: one(cartsTable, {
    fields: [cartItemsTable.cartId],
    references: [cartsTable.id],
  }),
  product: one(productsTable, {
    fields: [cartItemsTable.productId],
    references: [productsTable.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  createdByUser: one(usersTable, { fields: [coupons.createdBy], references: [usersTable.id] }),
  updatedByUser: one(usersTable, { fields: [coupons.updatedBy], references: [usersTable.id] }),
  redemptions: many(couponRedemptions),
}));

export const couponRedemptionsRelations = relations(couponRedemptions, ({ one }) => ({
  coupon: one(coupons, { fields: [couponRedemptions.couponId], references: [coupons.id] }),
  user: one(usersTable, { fields: [couponRedemptions.userId], references: [usersTable.id] }),
  order: one(ordersTable, { fields: [couponRedemptions.orderId], references: [ordersTable.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(usersTable, { fields: [wishlists.userId], references: [usersTable.id] }),
  product: one(productsTable, { fields: [wishlists.productId], references: [productsTable.id] }),
  variant: one(productVariants, {
    fields: [wishlists.variantId],
    references: [productVariants.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  product: one(productsTable, { fields: [reviews.productId], references: [productsTable.id] }),
  user: one(usersTable, { fields: [reviews.userId], references: [usersTable.id] }),
  votes: many(reviewVotes),
}));

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  review: one(reviews, { fields: [reviewVotes.reviewId], references: [reviews.id] }),
  user: one(usersTable, { fields: [reviewVotes.userId], references: [usersTable.id] }),
}));

export const shippingZonesRelations = relations(shippingZones, ({ many }) => ({
  rates: many(shippingRates),
}));

export const shippingRatesRelations = relations(shippingRates, ({ one }) => ({
  zone: one(shippingZones, { fields: [shippingRates.zoneId], references: [shippingZones.id] }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(productsTable, { fields: [inventory.productId], references: [productsTable.id] }),
}));
