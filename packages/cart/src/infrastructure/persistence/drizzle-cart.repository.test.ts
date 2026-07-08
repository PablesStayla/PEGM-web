import 'reflect-metadata';
import { Money } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Cart } from '../../domain/entities/cart.entity';
import { CartId } from '../../domain/entities/cart-id.vo';
import {
  CartItem,
  type CartItemId,
  type ProductId,
  type Sku,
} from '../../domain/entities/cart-item.vo';
import { DrizzleCartRepository } from './drizzle-cart.repository';

// Mock DB types and tables
const MOCK_CART_ID = 'cart_123' as any;
const MOCK_CUSTOMER_ID = 'cust_123' as any;
const _MOCK_SESSION_ID = 'sess_123' as any;

describe('DrizzleCartRepository', () => {
  let repository: DrizzleCartRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      query: {
        cartsTable: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
      },
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue({ count: 1 }),
      transaction: vi.fn((cb) => cb(mockDb)),
    };

    repository = new DrizzleCartRepository(mockDb);
  });

  describe('findById', () => {
    it('should return a cart when found', async () => {
      const cartId = CartId.create(MOCK_CART_ID).getValue();
      const mockRow = {
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
        sessionId: null,
        currency: 'USD',
        expiresAt: new Date(),
        items: [
          {
            id: 'item_1',
            productId: 'prod_1',
            sku: 'SKU-1',
            name: 'Product 1',
            quantity: 2,
            unitPrice: '10.00',
            imageUrl: null,
          },
        ],
      };

      mockDb.query.cartsTable.findFirst.mockResolvedValue(mockRow);

      const result = await repository.findById(cartId);

      expect(result.isSuccess).toBe(true);
      const cart = result.getValue();
      expect(cart).toBeDefined();
      expect(cart?.idValue).toBe(MOCK_CART_ID);
      expect(cart?.items).toHaveLength(1);
      expect(cart?.items[0].quantity).toBe(2);
    });

    it('should return null when cart not found', async () => {
      const cartId = CartId.create(MOCK_CART_ID).getValue();
      mockDb.query.cartsTable.findFirst.mockResolvedValue(null);

      const result = await repository.findById(cartId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBeNull();
    });

    it('should return error when query fails', async () => {
      const cartId = CartId.create(MOCK_CART_ID).getValue();
      mockDb.query.cartsTable.findFirst.mockRejectedValue(new Error('DB Error'));

      const result = await repository.findById(cartId);

      expect(result.isFailure).toBe(true);
      expect(result.errorValue.message).toBe('DB Error');
    });
  });

  describe('save', () => {
    it('should save a cart and its items successfully', async () => {
      const cartId = CartId.create(MOCK_CART_ID).getValue();
      const cartResult = Cart.create({
        id: cartId,
        customerId: MOCK_CUSTOMER_ID,
        currency: 'USD',
      });
      const cart = cartResult.getValue();

      const itemResult = CartItem.create({
        id: 'item_1' as CartItemId,
        productId: 'prod_1' as ProductId,
        sku: 'SKU-1' as Sku,
        name: 'Product 1',
        quantity: 1,
        unitPrice: Money.create(10, 'USD').getValue(),
      });
      cart.addItem(itemResult.getValue());

      const result = await repository.save(cart);

      expect(result.isSuccess).toBe(true);
      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalled(); // Items cleanup
    });
  });

  describe('findAll', () => {
    it('should return a list of carts', async () => {
      const mockRows = [
        {
          id: 'cart_1',
          customerId: 'cust_1',
          currency: 'USD',
          expiresAt: new Date(),
          items: [],
        },
        {
          id: 'cart_2',
          customerId: 'cust_2',
          currency: 'USD',
          expiresAt: new Date(),
          items: [],
        },
      ];

      mockDb.query.cartsTable.findMany.mockResolvedValue(mockRows);

      const result = await repository.findAll();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(2);
    });
  });

  describe('mergeCarts', () => {
    it('should merge two carts correctly', async () => {
      const sourceId = CartId.create('cart_source').getValue();
      const targetId = CartId.create('cart_target').getValue();

      const sourceCart = Cart.create({
        id: sourceId,
        customerId: 'cust_s',
        currency: 'USD',
      }).getValue();
      const targetCart = Cart.create({
        id: targetId,
        customerId: 'cust_t',
        currency: 'USD',
      }).getValue();

      const item = CartItem.create({
        id: 'item_s' as CartItemId,
        productId: 'prod_s' as ProductId,
        sku: 'SKU-S',
        name: 'Source Item',
        quantity: 1,
        unitPrice: Money.create(10, 'USD').getValue(),
      }).getValue();
      sourceCart.addItem(item);

      // Mock findById for both
      vi.spyOn(repository, 'findById')
        .mockResolvedValueOnce(
          Promise.resolve({ isSuccess: true, getValue: () => sourceCart } as any),
        )
        .mockResolvedValueOnce(
          Promise.resolve({ isSuccess: true, getValue: () => targetCart } as any),
        );

      const result = await repository.mergeCarts(sourceId, targetId);

      expect(result.isSuccess).toBe(true);
      expect(targetCart.items).toHaveLength(1);
      expect(mockDb.transaction).toHaveBeenCalled();
      // One delete for items cleanup, one for source cart deletion
      expect(mockDb.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired carts', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowCount: 5, count: 5 }),
      });

      const result = await repository.deleteExpired();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(5);
    });
  });
});
