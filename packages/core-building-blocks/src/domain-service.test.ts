import { describe, expect, it } from 'vitest';
import { DomainService } from './domain-service';

class PricingService extends DomainService {
  calculateMarkup(baseCents: number, percentBps: number): number {
    return Math.round((baseCents * percentBps) / 10_000);
  }
}

class InventoryService extends DomainService {}

describe('DomainService', () => {
  it('exposes serviceName from constructor', () => {
    const svc = new PricingService();
    expect(svc.serviceName).toBe('PricingService');
  });

  it('different subclasses have different serviceName', () => {
    const a = new PricingService();
    const b = new InventoryService();
    expect(a.serviceName).not.toBe(b.serviceName);
  });

  it('subclasses can define business logic', () => {
    const svc = new PricingService();
    expect(svc.calculateMarkup(100_000, 1900)).toBe(19_000);
  });

  it('is stateless — same results from fresh instances', () => {
    const a = new PricingService();
    const b = new PricingService();
    expect(a.calculateMarkup(50000, 500)).toBe(b.calculateMarkup(50000, 500));
  });
});
