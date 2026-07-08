import { describe, expect, it } from 'vitest';
import {
  BrandedIdError,
  createCarrierId,
  createFulfillmentOrderId,
  createNotificationId,
  createPaymentIntentId,
  createShippingRateId,
  createShippingZoneId,
  createStoreId,
  createTenantId,
} from './branded';

describe('New Branded Types — Factory Functions', () => {
  describe('createShippingZoneId', () => {
    it('creates a valid ShippingZoneId', () => {
      const result = createShippingZoneId('sz_metropolitana');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue()).toBe('sz_metropolitana');
      }
    });

    it('rejects empty string', () => {
      const result = createShippingZoneId('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorValue).toBeInstanceOf(BrandedIdError);
      }
    });

    it('rejects whitespace-only string', () => {
      const result = createShippingZoneId('   ');
      expect(result.success).toBe(false);
    });

    it('trims input before validation', () => {
      const result = createShippingZoneId('  sz_valpo  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue()).toBe('sz_valpo');
      }
    });
  });

  describe('createCarrierId', () => {
    it('creates a valid CarrierId', () => {
      const result = createCarrierId('carrier_starken');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue()).toBe('carrier_starken');
      }
    });

    it('rejects empty string', () => {
      const result = createCarrierId('');
      expect(result.success).toBe(false);
    });
  });

  describe('createFulfillmentOrderId', () => {
    it('creates a valid FulfillmentOrderId', () => {
      const result = createFulfillmentOrderId('fulfill_abc123');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue()).toBe('fulfill_abc123');
      }
    });

    it('rejects empty string', () => {
      const result = createFulfillmentOrderId('');
      expect(result.success).toBe(false);
    });
  });

  describe('createNotificationId', () => {
    it('creates a valid NotificationId', () => {
      const result = createNotificationId('notif_order_123');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue()).toBe('notif_order_123');
      }
    });

    it('rejects empty string', () => {
      const result = createNotificationId('');
      expect(result.success).toBe(false);
    });
  });

  describe('createPaymentIntentId', () => {
    it('creates a valid PaymentIntentId', () => {
      const result = createPaymentIntentId('pi_12345');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue()).toBe('pi_12345');
      }
    });

    it('rejects empty string', () => {
      const result = createPaymentIntentId('');
      expect(result.success).toBe(false);
    });
  });

  describe('createShippingRateId', () => {
    it('creates a valid ShippingRateId', () => {
      const result = createShippingRateId('sr_starken_express');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue()).toBe('sr_starken_express');
      }
    });

    it('rejects empty string', () => {
      const result = createShippingRateId('');
      expect(result.success).toBe(false);
    });
  });

  describe('createTenantId', () => {
    it('creates a valid TenantId', () => {
      const result = createTenantId('tenant_pranakaia');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue()).toBe('tenant_pranakaia');
      }
    });

    it('rejects empty string', () => {
      const result = createTenantId('');
      expect(result.success).toBe(false);
    });
  });

  describe('createStoreId', () => {
    it('creates a valid StoreId', () => {
      const result = createStoreId('store_main');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue()).toBe('store_main');
      }
    });

    it('rejects empty string', () => {
      const result = createStoreId('');
      expect(result.success).toBe(false);
    });
  });
});

describe('Branded Type Nominality', () => {
  it('ShippingZoneId is not assignable to CarrierId at compile time (structural match only)', () => {
    const zoneResult = createShippingZoneId('sz_test');
    const carrierResult = createCarrierId('carrier_test');
    expect(zoneResult.success).toBe(true);
    expect(carrierResult.success).toBe(true);
    if (zoneResult.success && carrierResult.success) {
      expect(zoneResult.getValue()).not.toBe(carrierResult.getValue());
    }
  });
});
