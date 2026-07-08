import type { Specification } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import { AndSpecification, NotSpecification, OrSpecification, specBuilder } from './specification';

interface Product {
  name: string;
  price: number;
  inStock: boolean;
}

const inStockSpec: Specification<Product> = {
  isSatisfiedBy: (p) => p.inStock,
};

const expensiveSpec: Specification<Product> = {
  isSatisfiedBy: (p) => p.price > 100,
};

const cheapSpec: Specification<Product> = {
  isSatisfiedBy: (p) => p.price < 50,
};

const keyboard: Product = { name: 'Keyboard', price: 120, inStock: true };
const mouse: Product = { name: 'Mouse', price: 30, inStock: true };
const monitor: Product = { name: 'Monitor', price: 300, inStock: false };
const cable: Product = { name: 'Cable', price: 10, inStock: false };

describe('AndSpecification', () => {
  it('satisfied when both specs are true', () => {
    const spec = new AndSpecification(inStockSpec, expensiveSpec);
    expect(spec.isSatisfiedBy(keyboard)).toBe(true);
  });

  it('not satisfied when left is false', () => {
    const spec = new AndSpecification(inStockSpec, expensiveSpec);
    expect(spec.isSatisfiedBy(mouse)).toBe(false);
  });

  it('not satisfied when right is false', () => {
    const spec = new AndSpecification(inStockSpec, expensiveSpec);
    expect(spec.isSatisfiedBy(monitor)).toBe(false);
  });

  it('not satisfied when both are false', () => {
    const spec = new AndSpecification(inStockSpec, expensiveSpec);
    expect(spec.isSatisfiedBy(cable)).toBe(false);
  });
});

describe('OrSpecification', () => {
  it('satisfied when both are true', () => {
    const spec = new OrSpecification(inStockSpec, cheapSpec);
    expect(spec.isSatisfiedBy(mouse)).toBe(true);
  });

  it('satisfied when only left is true', () => {
    const spec = new OrSpecification(inStockSpec, expensiveSpec);
    expect(spec.isSatisfiedBy(keyboard)).toBe(true);
  });

  it('satisfied when only right is true', () => {
    const spec = new OrSpecification(inStockSpec, cheapSpec);
    expect(spec.isSatisfiedBy(cable)).toBe(true);
  });

  it('not satisfied when neither is true', () => {
    const spec = new OrSpecification(inStockSpec, cheapSpec);
    const premiumOos: Product = { name: 'OOS Premium', price: 500, inStock: false };
    expect(spec.isSatisfiedBy(premiumOos)).toBe(false);
  });
});

describe('NotSpecification', () => {
  it('negates a satisfied spec', () => {
    const spec = new NotSpecification(inStockSpec);
    expect(spec.isSatisfiedBy(keyboard)).toBe(false);
  });

  it('negates an unsatisfied spec', () => {
    const spec = new NotSpecification(inStockSpec);
    expect(spec.isSatisfiedBy(monitor)).toBe(true);
  });
});

describe('specBuilder', () => {
  it('builds a simple specification', () => {
    const spec = specBuilder(inStockSpec).build();
    expect(spec.isSatisfiedBy(keyboard)).toBe(true);
  });

  it('chains AND', () => {
    const spec = specBuilder(inStockSpec).and(expensiveSpec).build();
    expect(spec.isSatisfiedBy(keyboard)).toBe(true);
    expect(spec.isSatisfiedBy(mouse)).toBe(false);
  });

  it('chains OR', () => {
    const spec = specBuilder(inStockSpec).or(cheapSpec).build();
    expect(spec.isSatisfiedBy(cable)).toBe(true);
  });

  it('chains NOT', () => {
    const spec = specBuilder(inStockSpec).not().build();
    expect(spec.isSatisfiedBy(monitor)).toBe(true);
    expect(spec.isSatisfiedBy(keyboard)).toBe(false);
  });

  it('chains complex: (inStock AND expensive) OR cheap', () => {
    const spec = specBuilder(inStockSpec).and(expensiveSpec).or(cheapSpec).build();
    expect(spec.isSatisfiedBy(keyboard)).toBe(true);
    expect(spec.isSatisfiedBy(mouse)).toBe(true);
    expect(spec.isSatisfiedBy(monitor)).toBe(false);
    expect(spec.isSatisfiedBy(cable)).toBe(true);
  });

  it('chains NOT after AND: NOT (inStock AND expensive)', () => {
    const spec = specBuilder(inStockSpec).and(expensiveSpec).not().build();
    expect(spec.isSatisfiedBy(mouse)).toBe(true);
    expect(spec.isSatisfiedBy(keyboard)).toBe(false);
  });
});
