/**
 * Logistics domain tests — Chilean carrier validation and tracking logic
 */
import { describe, expect, it } from 'vitest';
import type { TrackingInfo } from './index';
import { getLatestEvent, isDeliveryLate, isValidTrackingNumber } from './index';

describe('isValidTrackingNumber', () => {
  it('validates Starken (10-15 digits)', () => {
    expect(isValidTrackingNumber('12345678901', 'starken')).toBe(true);
    expect(isValidTrackingNumber('ABC', 'starken')).toBe(false);
  });

  it('validates BlueExpress (BE + 8-12 digits)', () => {
    expect(isValidTrackingNumber('BE12345678', 'blueexpress')).toBe(true);
    expect(isValidTrackingNumber('BX12345678', 'blueexpress')).toBe(false);
  });

  it('validates Chilexpress (2 letters + 8-12 digits + 2 letters)', () => {
    expect(isValidTrackingNumber('CL123456789CL', 'chilexpress')).toBe(true);
    expect(isValidTrackingNumber('123456789', 'chilexpress')).toBe(false);
  });

  it('validates Correos Chile (international format)', () => {
    expect(isValidTrackingNumber('CL123456789CL', 'correos_chile')).toBe(true);
  });

  it('accepts any 5+ char for unknown carrier', () => {
    expect(isValidTrackingNumber('OTHER123', 'otro')).toBe(true);
    expect(isValidTrackingNumber('X', 'otro')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidTrackingNumber('', 'starken')).toBe(false);
  });
});

describe('isDeliveryLate', () => {
  it('returns false when already delivered', () => {
    const info: TrackingInfo = {
      trackingNumber: '12345678901',
      carrier: 'starken',
      status: 'delivered',
      estimatedDeliveryDate: '2020-01-01', // past date
      events: [],
    };
    expect(isDeliveryLate(info)).toBe(false);
  });

  it('returns true when past ETA and not delivered', () => {
    const info: TrackingInfo = {
      trackingNumber: '12345678901',
      carrier: 'starken',
      status: 'in_transit',
      estimatedDeliveryDate: '2020-01-01', // very past
      events: [],
    };
    expect(isDeliveryLate(info)).toBe(true);
  });

  it('returns false when no ETA set', () => {
    const info: TrackingInfo = {
      trackingNumber: '12345678901',
      carrier: 'starken',
      status: 'in_transit',
      events: [],
    };
    expect(isDeliveryLate(info)).toBe(false);
  });
});

describe('getLatestEvent', () => {
  it('returns undefined for empty events', () => {
    const info: TrackingInfo = {
      trackingNumber: '12345678901',
      carrier: 'starken',
      status: 'pending',
      events: [],
    };
    expect(getLatestEvent(info)).toBeUndefined();
  });

  it('returns the most recent event', () => {
    const info: TrackingInfo = {
      trackingNumber: '12345678901',
      carrier: 'starken',
      status: 'in_transit',
      events: [
        {
          timestamp: '2024-01-01T10:00:00Z',
          location: 'Santiago',
          description: 'Received',
          status: 'pending',
        },
        {
          timestamp: '2024-01-02T15:30:00Z',
          location: 'Temuco',
          description: 'In transit',
          status: 'in_transit',
        },
        {
          timestamp: '2024-01-01T08:00:00Z',
          location: 'Proveedor',
          description: 'Picked up',
          status: 'ready_to_ship',
        },
      ],
    };
    const latest = getLatestEvent(info);
    expect(latest?.description).toBe('In transit');
    expect(latest?.status).toBe('in_transit');
  });
});
