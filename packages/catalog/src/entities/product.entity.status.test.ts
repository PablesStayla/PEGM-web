import { describe, expect, it } from 'vitest';
import { ProductStatusHelper } from '../domain/entities/product-types';

describe('Product Entity - Status Helpers', () => {
  describe('isSellable', () => {
    it('should identify sellable status', () => {
      expect(ProductStatusHelper.isSellable('ACTIVE')).toBe(true);
      expect(ProductStatusHelper.isSellable('DRAFT')).toBe(false);
      expect(ProductStatusHelper.isSellable('ARCHIVED')).toBe(false);
      expect(ProductStatusHelper.isSellable('OUT_OF_STOCK')).toBe(false);
    });
  });

  describe('isVisible', () => {
    it('should identify visible status', () => {
      expect(ProductStatusHelper.isVisible('ACTIVE')).toBe(true);
      expect(ProductStatusHelper.isVisible('OUT_OF_STOCK')).toBe(true);
      expect(ProductStatusHelper.isVisible('DRAFT')).toBe(false);
      expect(ProductStatusHelper.isVisible('ARCHIVED')).toBe(false);
    });
  });

  describe('canEdit', () => {
    it('should identify editable status', () => {
      expect(ProductStatusHelper.canEdit('DRAFT')).toBe(true);
      expect(ProductStatusHelper.canEdit('ARCHIVED')).toBe(true);
      expect(ProductStatusHelper.canEdit('ACTIVE')).toBe(false);
      expect(ProductStatusHelper.canEdit('OUT_OF_STOCK')).toBe(false);
    });
  });
});
