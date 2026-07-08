import { type BrandedId, Entity } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import { InMemoryRepository } from './in-memory-repository';

type TestId = BrandedId;

class TestEntity extends Entity<TestId> {
  constructor(
    id: TestId,
    public readonly name: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }
}

function makeId(raw: string): TestId {
  return raw as TestId;
}

function makeEntity(id: string, name: string): TestEntity {
  return new TestEntity(makeId(id), name);
}

describe('InMemoryRepository', () => {
  function createRepo() {
    return new InMemoryRepository<TestEntity, TestId>((e) => e.idValue as TestId);
  }

  it('starts empty', async () => {
    const repo = createRepo();
    expect(repo.count).toBe(0);
    const found = await repo.findById(makeId('t_1'));
    expect(found.isSuccess).toBe(true);
    if (found.isSuccess) {
      expect(found.getValue()).toBeNull();
    }
  });

  it('saves and finds an entity', async () => {
    const repo = createRepo();
    const entity = makeEntity('t_1', 'Alpha');
    const saveResult = await repo.save(entity);
    expect(saveResult.isSuccess).toBe(true);
    expect(repo.count).toBe(1);

    const found = await repo.findById(makeId('t_1'));
    expect(found.isSuccess).toBe(true);
    if (found.isSuccess) {
      expect(found.getValue()).not.toBeNull();
      expect(found.getValue()!.name).toBe('Alpha');
    }
  });

  it('overwrites on duplicate save (upsert)', async () => {
    const repo = createRepo();
    await repo.save(makeEntity('t_1', 'Alpha'));
    await repo.save(makeEntity('t_1', 'Alpha Updated'));
    expect(repo.count).toBe(1);
    const found = await repo.findById(makeId('t_1'));
    expect(found.isSuccess).toBe(true);
    if (found.isSuccess) {
      expect(found.getValue()!.name).toBe('Alpha Updated');
    }
  });

  it('finds all entities', async () => {
    const repo = createRepo();
    await repo.save(makeEntity('t_1', 'A'));
    await repo.save(makeEntity('t_2', 'B'));
    const all = await repo.findAll();
    expect(all.isSuccess).toBe(true);
    if (all.isSuccess) {
      expect(all.getValue()).toHaveLength(2);
    }
  });

  it('deletes an entity', async () => {
    const repo = createRepo();
    await repo.save(makeEntity('t_1', 'Alpha'));
    expect(repo.count).toBe(1);
    const delResult = await repo.delete(makeId('t_1'));
    expect(delResult.isSuccess).toBe(true);
    expect(repo.count).toBe(0);
  });

  it('delete is idempotent for missing id', async () => {
    const repo = createRepo();
    const delResult = await repo.delete(makeId('nonexistent'));
    expect(delResult.isSuccess).toBe(true);
  });

  it('checks existence', async () => {
    const repo = createRepo();
    const existsBefore = await repo.exists(makeId('t_1'));
    expect(existsBefore.isSuccess).toBe(true);
    if (existsBefore.isSuccess) {
      expect(existsBefore.getValue()).toBe(false);
    }

    await repo.save(makeEntity('t_1', 'Alpha'));
    const existsAfter = await repo.exists(makeId('t_1'));
    expect(existsAfter.isSuccess).toBe(true);
    if (existsAfter.isSuccess) {
      expect(existsAfter.getValue()).toBe(true);
    }
  });

  it('clear removes all entities', async () => {
    const repo = createRepo();
    await repo.save(makeEntity('t_1', 'A'));
    await repo.save(makeEntity('t_2', 'B'));
    expect(repo.count).toBe(2);
    repo.clear();
    expect(repo.count).toBe(0);
  });
});
