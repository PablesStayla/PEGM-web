import { Result } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import { type UnitOfWorkPort, withUnitOfWork } from './unit-of-work.port';

function createMockUow(overrides?: Partial<UnitOfWorkPort>): UnitOfWorkPort & {
  beginCalls: number;
  commitCalls: number;
  rollbackCalls: number;
} {
  let active = false;
  const uow = {
    beginCalls: 0,
    commitCalls: 0,
    rollbackCalls: 0,
    begin: async (): Promise<Result<void, Error>> => {
      uow.beginCalls++;
      active = true;
      return Result.ok();
    },
    commit: async (): Promise<Result<void, Error>> => {
      uow.commitCalls++;
      active = false;
      return Result.ok();
    },
    rollback: async (): Promise<Result<void, Error>> => {
      uow.rollbackCalls++;
      active = false;
      return Result.ok();
    },
    isActive: () => active,
    ...overrides,
  };
  return uow as typeof uow & UnitOfWorkPort;
}

describe('withUnitOfWork', () => {
  it('begins, runs fn, and commits on success', async () => {
    const uow = createMockUow();
    const result = await withUnitOfWork(uow, async () => Result.ok(42));
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.getValue()).toBe(42);
    }
    expect(uow.beginCalls).toBe(1);
    expect(uow.commitCalls).toBe(1);
    expect(uow.rollbackCalls).toBe(0);
  });

  it('rolls back when fn returns a failure', async () => {
    const uow = createMockUow();
    const result = await withUnitOfWork(uow, async () =>
      Result.fail(new Error('business rule violation')),
    );
    expect(result.isFailure).toBe(true);
    expect(uow.rollbackCalls).toBe(1);
    expect(uow.commitCalls).toBe(0);
  });

  it('rolls back when fn throws', async () => {
    const uow = createMockUow();
    const result = await withUnitOfWork(uow, async () => {
      throw new Error('unexpected');
    });
    expect(result.isFailure).toBe(true);
    expect(uow.rollbackCalls).toBe(1);
    expect(uow.commitCalls).toBe(0);
  });

  it('rolls back when commit fails', async () => {
    const uow = createMockUow({
      commit: async () => Result.fail(new Error('commit failed')),
    });
    const result = await withUnitOfWork(uow, async () => Result.ok('data'));
    expect(result.isFailure).toBe(true);
    expect(uow.rollbackCalls).toBe(1);
  });

  it('returns failure when begin fails', async () => {
    const uow = createMockUow({
      begin: async () => Result.fail(new Error('connection refused')),
    });
    const result = await withUnitOfWork(uow, async () => Result.ok('never'));
    expect(result.isFailure).toBe(true);
    expect(uow.commitCalls).toBe(0);
    expect(uow.rollbackCalls).toBe(0);
  });
});
