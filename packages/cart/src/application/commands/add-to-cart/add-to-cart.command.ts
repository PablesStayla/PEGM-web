export interface AddToCartCommandProps {
  customerId?: string;
  sessionId?: string;
  productId: string;
  quantity: number;
  currency?: string;
}

export class AddToCartCommand {
  readonly customerId: string | undefined;
  readonly sessionId: string | undefined;
  readonly productId: string;
  readonly quantity: number;
  readonly currency: string;

  constructor(props: AddToCartCommandProps) {
    if (!props.customerId && !props.sessionId) {
      throw new Error('Either customerId or sessionId must be provided');
    }
    this.customerId = props.customerId;
    this.sessionId = props.sessionId;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.currency = props.currency ?? 'USD';
  }
}
