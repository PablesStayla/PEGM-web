import { describe, expect, it } from 'vitest';
import { CLEANUP_TASKS, getTaskById, getTaskIds } from './define-cleanup-tasks.js';

describe('define-cleanup-tasks', () => {
  describe('CLEANUP_TASKS', () => {
    it('should have tasks defined', () => {
      expect(CLEANUP_TASKS.length).toBeGreaterThan(0);
    });
    it('should each have id, pattern, and description', () => {
      for (const task of CLEANUP_TASKS) {
        expect(task.id).toBeTruthy();
        expect(task.pattern).toBeTruthy();
        expect(task.description).toBeTruthy();
      }
    });
  });

  describe('getTaskById', () => {
    it('should find existing task', () => {
      if (CLEANUP_TASKS.length > 0) {
        const id = CLEANUP_TASKS[0].id;
        const result = getTaskById(id);
        expect(result).toBeDefined();
        expect(result?.id).toBe(id);
      }
    });
    it('should return undefined for unknown task', () => {
      const result = getTaskById('nonexistent-task-xyz');
      expect(result).toBeUndefined();
    });
  });

  describe('getTaskIds', () => {
    it('should return all task ids', () => {
      const ids = getTaskIds();
      expect(ids.length).toBe(CLEANUP_TASKS.length);
    });
  });
});
