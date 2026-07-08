/**
 * Union type of all supplier domain events.
 *
 * @example
 * ```ts
 * const event: SupplierEvent = { type: 'SUPPLIER_CREATED', supplierId: 'sup_1' };
 * switch (event.type) {
 *   case 'SUPPLIER_CREATED':       // ...
 *   case 'SUPPLIER_PRODUCT_CREATED': // ...
 *   case 'DROPSHIP_ORDER_CREATED': // ...
 * }
 * ```
 */
export type SupplierEvent =
  | { readonly type: 'SUPPLIER_CREATED'; readonly supplierId: string }
  | { readonly type: 'SUPPLIER_PRODUCT_CREATED'; readonly supplierProductId: string }
  | { readonly type: 'DROPSHIP_ORDER_CREATED'; readonly orderId: string };
