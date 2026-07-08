import { describe, expect, it } from 'vitest';
import {
  getLatestEvent,
  isDeliveryLate,
  isValidTrackingNumber,
  type TrackingEvent,
  type TrackingInfo,
} from './tracking.vo';

describe('Tracking Value Objects', () => {
  // ── isValidTrackingNumber ─────────────────────────────────────────────

  describe('isValidTrackingNumber()', () => {
    it('should validate Starken format (10-15 digits)', () => {
      expect(isValidTrackingNumber('1234567890', 'starken')).toBe(true);
      expect(isValidTrackingNumber('123456789012345', 'starken')).toBe(true);
      expect(isValidTrackingNumber('1234', 'starken')).toBe(false);
      expect(isValidTrackingNumber('ABC1234567', 'starken')).toBe(false);
    });

    it('should validate BlueExpress format (BE + 8-12 digits)', () => {
      expect(isValidTrackingNumber('BE12345678', 'blueexpress')).toBe(true);
      expect(isValidTrackingNumber('BE123456789012', 'blueexpress')).toBe(true);
      expect(isValidTrackingNumber('12345678', 'blueexpress')).toBe(false);
      expect(isValidTrackingNumber('BE123', 'blueexpress')).toBe(false);
    });

    it('should validate Chilexpress format (2 letters + 8-12 digits + 2 letters)', () => {
      expect(isValidTrackingNumber('CL12345678XX', 'chilexpress')).toBe(true);
      expect(isValidTrackingNumber('XX123456789012YY', 'chilexpress')).toBe(true);
      expect(isValidTrackingNumber('12345678XX', 'chilexpress')).toBe(false);
    });

    it('should validate CorreosChile format (2 letters + 9 digits + 2 letters)', () => {
      expect(isValidTrackingNumber('CL123456789XX', 'correos_chile')).toBe(true);
      expect(isValidTrackingNumber('XX123456789CL', 'correos_chile')).toBe(true);
      expect(isValidTrackingNumber('CL123XX', 'correos_chile')).toBe(false);
    });

    it('should accept any string ≥5 chars for unknown carrier', () => {
      expect(isValidTrackingNumber('ABCDE', 'otro')).toBe(true);
      expect(isValidTrackingNumber('ABCD', 'otro')).toBe(false);
    });

    it('should reject empty or whitespace strings', () => {
      expect(isValidTrackingNumber('', 'starken')).toBe(false);
      expect(isValidTrackingNumber('   ', 'starken')).toBe(false);
    });
  });

  // ── isDeliveryLate ────────────────────────────────────────────────────

  describe('isDeliveryLate()', () => {
    const baseInfo = {
      trackingNumber: '1234567890',
      carrier: 'starken' as const,
      status: 'in_transit' as const,
      events: [] as TrackingEvent[],
    };

    it('should return false if no estimated date', () => {
      expect(isDeliveryLate({ ...baseInfo })).toBe(false);
    });

    it('should return false if estimated date is in the future', () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      expect(isDeliveryLate({ ...baseInfo, estimatedDeliveryDate: future })).toBe(false);
    });

    it('should return true if estimated date is in the past and not delivered', () => {
      const past = new Date(Date.now() - 86400000).toISOString();
      expect(isDeliveryLate({ ...baseInfo, estimatedDeliveryDate: past })).toBe(true);
    });

    it('should return false if already delivered', () => {
      const past = new Date(Date.now() - 86400000).toISOString();
      expect(
        isDeliveryLate({ ...baseInfo, status: 'delivered', estimatedDeliveryDate: past }),
      ).toBe(false);
    });
  });

  // ── getLatestEvent ────────────────────────────────────────────────────

  describe('getLatestEvent()', () => {
    it('should return undefined for empty events', () => {
      const info: TrackingInfo = {
        trackingNumber: '1234567890',
        carrier: 'starken',
        status: 'pending',
        events: [],
      };
      expect(getLatestEvent(info)).toBeUndefined();
    });

    it('should return the most recent event', () => {
      const info: TrackingInfo = {
        trackingNumber: '1234567890',
        carrier: 'starken',
        status: 'in_transit',
        events: [
          {
            timestamp: '2026-05-10T10:00:00Z',
            location: 'Santiago',
            description: 'Picked up',
            status: 'in_transit',
          },
          {
            timestamp: '2026-05-11T14:00:00Z',
            location: 'Concepción',
            description: 'In transit',
            status: 'in_transit',
          },
        ],
      };
      const latest = getLatestEvent(info);
      expect(latest?.description).toBe('In transit');
    });
  });
});
