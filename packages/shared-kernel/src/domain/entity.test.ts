import { describe, expect, it } from 'vitest';
import { type BrandedId, Entity, type EntityId } from './entity';

class TestId implements EntityId {
  constructor(public readonly value: string) {}
  equals(other: EntityId): boolean {
    return other instanceof TestId && this.value === other.value;
  }
  toString(): string {
    return this.value;
  }
}

class TestEntity extends Entity<BrandedId | TestId> {
  constructor(
    id: BrandedId | TestId,
    public readonly name: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }
}

describe('Entity - Construction', () => {
  describe('construction', () => {
    it('should create entity with branded string id', () => {
      const entity = new TestEntity('entity-1' as BrandedId, 'Test Entity');

      expect(entity.id).toBe('entity-1');
      expect(entity.name).toBe('Test Entity');
    });

    it('should create entity with EntityId', () => {
      const testId = new TestId('entity-1');
      const entity = new TestEntity(testId, 'Test Entity');

      expect(entity.id).toBe(testId);
    });

    it('should set createdAt and updatedAt dates', () => {
      const now = new Date();
      const entity = new TestEntity('entity-1' as BrandedId, 'Test', now, now);

      expect(entity.createdAt).toBe(now);
      expect(entity.updatedAt).toBe(now);
    });

    it('should default to current date if not provided', () => {
      const before = Date.now();
      const entity = new TestEntity('entity-1' as BrandedId, 'Test');
      const after = Date.now();

      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(entity.createdAt.getTime()).toBeLessThanOrEqual(after);
    });
  });
});

describe('Entity - ID Operations', () => {
  describe('idValue', () => {
    it('should return string value for string id', () => {
      const entity = new TestEntity('entity-1' as BrandedId, 'Test');

      expect(entity.idValue).toBe('entity-1');
    });

    it('should return value property for EntityId', () => {
      const testId = new TestId('entity-1');
      const entity = new TestEntity(testId, 'Test');

      expect(entity.idValue).toBe('entity-1');
    });

    it('should handle BrandedId', () => {
      const brandedId = 'prod-123' as BrandedId;
      const entity = new TestEntity(brandedId, 'Test');

      expect(entity.idValue).toBe('prod-123');
    });
  });
});

describe('Entity - Equality', () => {
  describe('equals', () => {
    it('should return true for same id', () => {
      const entity1 = new TestEntity('entity-1' as BrandedId, 'Test 1');
      const entity2 = new TestEntity('entity-1' as BrandedId, 'Test 2');

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false for different id', () => {
      const entity1 = new TestEntity('entity-1' as BrandedId, 'Test 1');
      const entity2 = new TestEntity('entity-2' as BrandedId, 'Test 2');

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false for different type', () => {
      const entity1 = new TestEntity('entity-1' as BrandedId, 'Test 1');
      const differentType = { id: 'entity-1' };

      expect(entity1.equals(differentType as any)).toBe(false);
    });

    it('should return true for same reference', () => {
      const entity = new TestEntity('entity-1' as BrandedId, 'Test');

      expect(entity.equals(entity)).toBe(true);
    });

    it('should return false for null', () => {
      const entity = new TestEntity('entity-1' as BrandedId, 'Test');

      expect(entity.equals(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      const entity = new TestEntity('entity-1' as BrandedId, 'Test');

      expect(entity.equals(undefined as any)).toBe(false);
    });
  });
});

describe('Entity - Type Safety', () => {
  describe('type checks', () => {
    it('should accept EntityId', () => {
      const testId = new TestId('entity-1');
      const entity = new TestEntity(testId, 'Test');

      expect(entity.id).toBe(testId);
    });

    it('should accept branded string', () => {
      const entity = new TestEntity('entity-1' as BrandedId, 'Test');

      expect(entity.id).toBe('entity-1');
    });

    it('should handle BrandedId type', () => {
      type TestBranded = BrandedId & { __brand: 'test' };
      const brandedId = 'test-123' as TestBranded;
      const entity = new TestEntity(brandedId, 'Test');

      expect(entity.id).toBe(brandedId);
    });
  });
});

describe('Entity - Edge Cases', () => {
  it('should handle empty string id', () => {
    const entity = new TestEntity('' as BrandedId, 'Test');

    expect(entity.id).toBe('');
  });

  it('should handle special characters in id', () => {
    const entity = new TestEntity('entity-1_special' as BrandedId, 'Test');

    expect(entity.id).toBe('entity-1_special');
  });

  it('should handle long ids', () => {
    const longId = 'a'.repeat(1000) as BrandedId;
    const entity = new TestEntity(longId, 'Test');

    expect(entity.id).toBe(longId);
  });
});
