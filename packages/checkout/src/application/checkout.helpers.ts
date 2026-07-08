import {
  Cart,
  CartId,
  CartItem,
  CartItemIdHelper,
  type CartItemProps,
  type CreateCartProps,
} from '@pranakaia/cart';
import { Product, SKU } from '@pranakaia/catalog';
import { type CurrencyCode, GUEST_USER_ID, Money, ProductIdHelper } from '@pranakaia/shared-kernel';

const MOCK_CART_ID = 'cart_1111111111_abc';
const MOCK_CUSTOMER_ID = '22222222-2222-4222-8222-222222222222';
const MOCK_PRODUCT_ID = 'prod_3333333333_def';

class CartItemBuilder {
  private props: CartItemProps = {
    id: CartItemIdHelper.generate(),
    productId: ProductIdHelper.from(MOCK_PRODUCT_ID),
    name: 'LED Grow Light',
    sku: 'LED-001',
    unitPrice: (() => {
      const result = Money.create({ amount: 10_000, currency: 'CLP' });
      if (result.isFailure) {
        throw result.errorValue;
      }
      return result.getValue();
    })(),
    quantity: 1,
    imageUrl: 'https://cdn.example.com/led.jpg',
  };

  withPrice(amount: number, currency: CurrencyCode = 'CLP') {
    const result = Money.create({ amount, currency });
    if (result.isFailure) {
      throw result.errorValue;
    }
    this.props.unitPrice = result.getValue();
    return this;
  }

  withQuantity(quantity: number) {
    this.props.quantity = quantity;
    return this;
  }

  withProductId(productId: string) {
    this.props.productId = ProductIdHelper.from(productId);
    return this;
  }

  build(): CartItem {
    const result = CartItem.create(this.props);
    if (result.isFailure) {
      throw result.errorValue;
    }
    return result.getValue();
  }
}

class CartBuilder {
  private props: CreateCartProps = {
    id: CartId.from(MOCK_CART_ID),
    currency: 'CLP',
    customerId: MOCK_CUSTOMER_ID,
  };
  private items: CartItem[] = [];

  forGuest() {
    this.props.customerId = undefined;
    this.props.sessionId = GUEST_USER_ID;
    return this;
  }

  withCustomerId(customerId: string) {
    this.props.customerId = customerId;
    this.props.sessionId = undefined;
    return this;
  }

  addItem(item?: CartItem) {
    this.items.push(item || new CartItemBuilder().build());
    return this;
  }

  withItems(count: number, price = 10_000) {
    for (let i = 0; i < count; i++) {
      this.items.push(new CartItemBuilder().withPrice(price).build());
    }
    return this;
  }

  build(): Cart {
    const cartResult = Cart.create(this.props);
    if (cartResult.isFailure) {
      throw cartResult.errorValue;
    }
    const cart = cartResult.getValue();
    for (const item of this.items) {
      const addResult = cart.addItem(item);
      if (addResult.isFailure) {
        throw addResult.errorValue;
      }
    }
    return cart;
  }
}

function makeMoney(amount: number, currency: CurrencyCode): Money {
  const r = Money.create({ amount, currency });
  if (r.isFailure) {
    throw r.errorValue;
  }
  return r.getValue();
}

function buildProduct(price = 10_000): Product {
  const skuResult = SKU.create('LED-001');
  if (!skuResult.success) {
    throw skuResult.error;
  }
  const productResult = Product.create({
    id: ProductIdHelper.from(MOCK_PRODUCT_ID),
    name: 'LED Grow Light',
    description: 'Full spectrum lamp for growing plants indoors',
    price: makeMoney(price, 'CLP'),
    sku: skuResult.getValue(),
    stockQuantity: 10,
    images: ['https://cdn.example.com/led.jpg'],
  });
  if (productResult.isFailure) {
    throw productResult.errorValue;
  }
  return productResult.getValue();
}

function buildCart(customerId: string | null, price = 10_000, quantity = 1): Cart {
  const builder = new CartBuilder();
  if (customerId === null || customerId === GUEST_USER_ID || customerId === 'GUEST') {
    builder.forGuest();
  } else {
    builder.withCustomerId(customerId);
  }
  if (quantity > 0) {
    builder.withItems(quantity, price);
  }
  return builder.build();
}

export {
  buildCart,
  buildProduct,
  CartBuilder,
  CartItemBuilder,
  MOCK_CART_ID,
  MOCK_CUSTOMER_ID,
  MOCK_PRODUCT_ID,
  makeMoney,
};
