import { describe, expect, it } from 'vitest';
import { none, Option, some } from './option';

describe('Option', () => {
  // ── Creation ──────────────────────────────────────────────────────────

  describe('some()', () => {
    it('should create a Some option', () => {
      const opt = Option.some(42);
      expect(opt._tag).toBe('Some');
      expect(opt.value).toBe(42);
    });

    it('should create a Some with an object', () => {
      const opt = Option.some({ name: 'test' });
      expect(opt._tag).toBe('Some');
      expect(opt.value).toEqual({ name: 'test' });
    });

    it('should work with exported some shorthand', () => {
      const opt = some(10);
      expect(opt._tag).toBe('Some');
      expect(opt.value).toBe(10);
    });
  });

  describe('none()', () => {
    it('should create a None option', () => {
      const opt = Option.none();
      expect(opt._tag).toBe('None');
    });

    it('should work with exported none shorthand', () => {
      const opt = none();
      expect(opt._tag).toBe('None');
    });
  });

  describe('fromNullable()', () => {
    it('should return Some for non-null values', () => {
      const opt = Option.fromNullable('hello');
      expect(opt._tag).toBe('Some');
      if (opt._tag === 'Some') {
        expect(opt.value).toBe('hello');
      }
    });

    it('should return None for null', () => {
      const opt = Option.fromNullable(null);
      expect(opt._tag).toBe('None');
    });

    it('should return None for undefined', () => {
      const opt = Option.fromNullable(undefined);
      expect(opt._tag).toBe('None');
    });
  });

  // ── Pattern Matching ──────────────────────────────────────────────────

  describe('match()', () => {
    it('should call some handler for Some', () => {
      const result = Option.match(Option.some(5), {
        some: (v) => v * 2,
        none: () => 0,
      });
      expect(result).toBe(10);
    });

    it('should call none handler for None', () => {
      const result = Option.match(Option.none(), {
        some: (v) => v * 2,
        none: () => 0,
      });
      expect(result).toBe(0);
    });
  });

  // ── Transformation ────────────────────────────────────────────────────

  describe('map()', () => {
    it('should transform the value inside Some', () => {
      const opt = Option.map(Option.some(5), (x) => x * 2);
      expect(opt._tag).toBe('Some');
      if (opt._tag === 'Some') {
        expect(opt.value).toBe(10);
      }
    });

    it('should return None when mapping None', () => {
      const opt = Option.map(Option.none(), (x: number) => x * 2);
      expect(opt._tag).toBe('None');
    });
  });

  describe('flatMap()', () => {
    it('should chain Some-returning functions', () => {
      const opt = Option.flatMap(Option.some(5), (x) => Option.some(x * 2));
      expect(opt._tag).toBe('Some');
      if (opt._tag === 'Some') {
        expect(opt.value).toBe(10);
      }
    });

    it('should return None when chaining from None', () => {
      const opt = Option.flatMap(Option.none(), (x: number) => Option.some(x * 2));
      expect(opt._tag).toBe('None');
    });

    it('should propagate None from chained function', () => {
      const opt = Option.flatMap(Option.some(5), () => Option.none());
      expect(opt._tag).toBe('None');
    });
  });

  // ── Access ────────────────────────────────────────────────────────────

  describe('getOrElse()', () => {
    it('should return the value for Some', () => {
      expect(Option.getOrElse(Option.some(42), 0)).toBe(42);
    });

    it('should return the default for None', () => {
      expect(Option.getOrElse(Option.none(), 0)).toBe(0);
    });
  });

  // ── Type Guards ───────────────────────────────────────────────────────

  describe('isSome()', () => {
    it('should return true for Some', () => {
      expect(Option.isSome(Option.some(1))).toBe(true);
    });

    it('should return false for None', () => {
      expect(Option.isSome(Option.none())).toBe(false);
    });

    it('should narrow type', () => {
      const opt = Option.some(42) as Option<number>;
      if (Option.isSome(opt)) {
        expect(opt.value).toBe(42);
      }
    });
  });

  describe('isNone()', () => {
    it('should return true for None', () => {
      expect(Option.isNone(Option.none())).toBe(true);
    });

    it('should return false for Some', () => {
      expect(Option.isNone(Option.some(1))).toBe(false);
    });
  });

  // ── Immutability ──────────────────────────────────────────────────────

  describe('immutability', () => {
    it('should freeze Some values', () => {
      const opt = Option.some({ x: 1 });
      expect(Object.isFrozen(opt)).toBe(true);
    });

    it('should freeze None values', () => {
      const opt = Option.none();
      expect(Object.isFrozen(opt)).toBe(true);
    });
  });
});
