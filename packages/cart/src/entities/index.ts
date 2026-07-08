// Re-exports for backward compatibility — files moved to domain/
export {
  Cart,
  type Currency,
  type CustomerId,
  type SessionId,
} from '../domain/entities/cart.entity';
export { CartId } from '../domain/entities/cart-id.vo';
export {
  CartItem,
  type CartItemId,
  CartItemIdHelper,
  type CartItemProps,
  type ProductId,
  type Sku,
} from '../domain/entities/cart-item.vo';
