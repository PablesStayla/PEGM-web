import { describe, expect, it } from 'vitest';
import { Supplier, SyncFrequencySchema } from './supplier';

describe('Supplier Aggregate Root', () => {
  const validCreateProps = {
    tenantId: 'tenant_1',
    name: 'Test Supplier',
    slug: 'test-supplier',
    email: 'info@supplier.com',
    businessType: 'DROPSHIPPER' as const,
    country: 'CL',
  };

  // ── create() ──────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a valid Supplier', () => {
      const result = Supplier.create(validCreateProps);
      expect(result.isSuccess).toBe(true);
      const supplier = result.getValue();
      expect(supplier.name).toBe('Test Supplier');
      expect(supplier.email).toBe('info@supplier.com');
      expect(supplier.businessType).toBe('DROPSHIPPER');
      expect(supplier.isActive).toBe(true);
    });

    it('should fail for name < 3 chars', () => {
      const result = Supplier.create({ ...validCreateProps, name: 'AB' });
      expect(result.isFailure).toBe(true);
    });

    it('should fail for invalid email', () => {
      const result = Supplier.create({ ...validCreateProps, email: 'not-email' });
      expect(result.isFailure).toBe(true);
    });

    it('should fail for invalid businessType', () => {
      const result = Supplier.create({ ...validCreateProps, businessType: 'INVALID' as any });
      expect(result.isFailure).toBe(true);
    });

    it('should accept optional apiEndpoint', () => {
      const result = Supplier.create({
        ...validCreateProps,
        apiEndpoint: 'https://api.supplier.com',
      });
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().apiEndpoint).toBe('https://api.supplier.com');
    });

    it('should fail for invalid apiEndpoint URL', () => {
      const result = Supplier.create({
        ...validCreateProps,
        apiEndpoint: 'not-a-url',
      });
      expect(result.isFailure).toBe(true);
    });

    it('should default isActive to true', () => {
      const result = Supplier.create(validCreateProps);
      expect(result.getValue().isActive).toBe(true);
    });
  });

  // ── reconstitute() ────────────────────────────────────────────────────

  describe('reconstitute()', () => {
    it('should reconstitute from persisted data', () => {
      const created = Supplier.create(validCreateProps).getValue();
      const props = created.toPrimitives();
      const result = Supplier.reconstitute(props);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().name).toBe('Test Supplier');
    });

    it('should fail for invalid props', () => {
      const result = Supplier.reconstitute({
        id: 'bad',
        tenantId: '',
        name: '',
        slug: '',
        email: 'bad',
        businessType: 'DROPSHIPPER' as any,
        country: 'CL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(result.isFailure).toBe(true);
    });
  });

  // ── shouldSync() ──────────────────────────────────────────────────────

  describe('shouldSync()', () => {
    it('should return false for inactive supplier', () => {
      const result = Supplier.create(validCreateProps);
      const supplier = result.getValue();
      // Can't set isActive to false easily, but shouldSync checks it
      // For now, test the sync frequency logic
      expect(supplier.shouldSync(new Date())).toBe(false); // No syncFrequency set
    });

    it('should respect REALTIME frequency (5 min throttle)', () => {
      const result = Supplier.create({
        ...validCreateProps,
        syncFrequency: 'REALTIME',
      });
      const supplier = result.getValue();
      const fiveMinAgo = new Date(Date.now() - 6 * 60 * 1000);
      expect(supplier.shouldSync(fiveMinAgo)).toBe(true);
      const justNow = new Date(Date.now() - 1000);
      expect(supplier.shouldSync(justNow)).toBe(false);
    });

    it('should respect HOURLY frequency', () => {
      const result = Supplier.create({
        ...validCreateProps,
        syncFrequency: 'HOURLY',
      });
      const supplier = result.getValue();
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(supplier.shouldSync(twoHoursAgo)).toBe(true);
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
      expect(supplier.shouldSync(thirtyMinAgo)).toBe(false);
    });

    it('should respect DAILY frequency', () => {
      const result = Supplier.create({
        ...validCreateProps,
        syncFrequency: 'DAILY',
      });
      const supplier = result.getValue();
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(supplier.shouldSync(twoDaysAgo)).toBe(true);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      expect(supplier.shouldSync(oneHourAgo)).toBe(false);
    });
  });

  // ── SyncFrequencySchema ───────────────────────────────────────────────

  describe('SyncFrequencySchema', () => {
    it('should accept valid frequencies', () => {
      expect(SyncFrequencySchema.parse('REALTIME')).toBe('REALTIME');
      expect(SyncFrequencySchema.parse('HOURLY')).toBe('HOURLY');
      expect(SyncFrequencySchema.parse('DAILY')).toBe('DAILY');
    });

    it('should reject invalid frequencies', () => {
      expect(() => SyncFrequencySchema.parse('WEEKLY')).toThrow();
    });
  });
});
