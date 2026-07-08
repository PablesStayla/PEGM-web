import type { CartId } from '../../../domain/entities/cart-id.vo';
import type { CartItemId } from '../../../domain/entities/cart-item.vo';

export interface RemoveFromCartCommandProps {
  cartId: CartId;
  itemId: CartItemId;
}

export class RemoveFromCartCommand {
  readonly cartId: CartId;
  readonly itemId: CartItemId;

  constructor(props: RemoveFromCartCommandProps) {
    this.cartId = props.cartId;
    this.itemId = props.itemId;
  }
}
