import { ProductIdHelper } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import { Product } from '../domain/entities/product.entity';
import { ProductPriceChanged, ProductStockUpdated } from '../domain/events/product.events';
import { Money } from '../domain/value-objects/money.vo';
import { SKU } from '../domain/value-objects/sku.vo';

const createTestProduct = (overrides?: Partial<{ stockQuantity: number }>) => ({
  id: ProductIdHelper.generate(),
  sku: SKU.create('TEST-SKU-001').value!,
  name: 'Test Product',
  description: 'This is a test product description',
  price: Money.create(100, 'USD').value!,
  stockQuantity: overrides?.stockQuantity ?? 10,
});

describe('Product Entity - Price Operations', () => {
  let product: Product;

  beforeEach(() => {
    const result = Product.create(createTestProduct());
    if (result.success) {
      product = result.value;
    }
  });

  describe('Price Changes', () => {
    it('should update price successfully', () => {
      const newPrice = Money.create(150, 'USD').value!;
      const result = product.changePrice(newPrice);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(product.price.amount).toBe(150);
      }
    });

    it('should emit ProductPriceChanged event', () => {
      const newPrice = Money.create(150, 'USD').value!;
      product.changePrice(newPrice);

      const events = product.getUncommittedEvents();
      const priceChangeEvent = events.find((e) => e instanceof ProductPriceChanged);

      expect(priceChangeEvent).toBeDefined();
      if (priceChangeEvent) {
        expect((priceChangeEvent as ProductPriceChanged).oldPrice).toBe(100);
        expect((priceChangeEvent as ProductPriceChanged).newPrice).toBe(150);
      }
    });

    it('should not emit event if price is unchanged', () => {
      product.clearEvents();
      const samePrice = Money.create(100, 'USD').value!;
      product.changePrice(samePrice);

      const events = product.getUncommittedEvents();
      expect(events).toHaveLength(0);
    });

    it('should reject negative price', () => {
      const negativePriceResult = Money.create(-50, 'USD');
      if (!negativePriceResult.success) {
        return;
      }
      const negativePrice = negativePriceResult.value;

      const result = product.changePrice(negativePrice);

      expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
      const zeroPriceResult = Money.create(0, 'USD');
      if (!zeroPriceResult.success) {
        return;
      }
      const zeroPrice = zeroPriceResult.value;

      const result = product.changePrice(zeroPrice);

      expect(result.success).toBe(false);
    });
  });
});

describe('Product Entity - Stock Operations', () => {
  let product: Product;

  beforeEach(() => {
    const result = Product.create(createTestProduct());
    if (result.success) {
      product = result.value;
    }
  });

  describe('Stock Updates', () => {
    it('should update stock successfully', () => {
      const result = product.updateStock(50);

      expect(result.success).toBe(true);
      expect(product.stockQuantity).toBe(50);
    });

    it('should transition to OUT_OF_STOCK when quantity becomes 0', () => {
      product.updateStock(0);

      expect(product.status).toBe('OUT_OF_STOCK');
      expect(product.isAvailable).toBe(false);
    });

    it('should transition to ACTIVE when restocked from 0', () => {
      product.updateStock(0);
      product.updateStock(10);

      expect(product.status).toBe('ACTIVE');
      expect(product.isAvailable).toBe(true);
    });

    it('should emit ProductStockUpdated event', () => {
      product.clearEvents();
      product.updateStock(50);

      const events = product.getUncommittedEvents();
      const stockEvent = events.find((e) => e instanceof ProductStockUpdated);

      expect(stockEvent).toBeDefined();
      if (stockEvent) {
        expect((stockEvent as ProductStockUpdated).quantity).toBe(50);
      }
    });

    it('should reject negative stock', () => {
      const result = product.updateStock(-5);

      expect(result.success).toBe(false);
    });
  });
});
