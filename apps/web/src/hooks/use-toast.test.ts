import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reducer, toast } from './use-toast';

/**
 * Unit tests for the toast reducer and toast() API.
 * The reducer is a pure function â€” no mocks needed.
 * toast() tests use vi.useFakeTimers to control auto-dismiss.
 */

// â”€â”€ Reducer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('toast reducer', () => {
  const emptyState: { toasts: any[] } = { toasts: [] };

  const sampleToast = {
    id: 'toast-1',
    title: 'Producto agregado',
    open: true,
  };

  describe('ADD_TOAST', () => {
    it('adds a toast to the queue', () => {
      const next = reducer(emptyState, { type: 'ADD_TOAST', toast: sampleToast });
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].id).toBe('toast-1');
    });

    it('prepends new toasts (newest first)', () => {
      const state1 = reducer(emptyState, {
        type: 'ADD_TOAST',
        toast: { id: 'first', title: 'First', open: true },
      });
      const state2 = reducer(state1, {
        type: 'ADD_TOAST',
        toast: { id: 'second', title: 'Second', open: true },
      });
      expect(state2.toasts[0].id).toBe('second');
      expect(state2.toasts[1].id).toBe('first');
    });

    it('respects TOAST_LIMIT (max 3 toasts)', () => {
      let state = emptyState;
      for (let i = 0; i < 5; i++) {
        state = reducer(state, {
          type: 'ADD_TOAST',
          toast: { id: `t-${i}`, title: `Toast ${i}`, open: true },
        });
      }
      expect(state.toasts.length).toBeLessThanOrEqual(3);
    });
  });

  describe('UPDATE_TOAST', () => {
    it('merges updated fields into the matching toast', () => {
      const state = reducer(emptyState, { type: 'ADD_TOAST', toast: sampleToast });
      const updated = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: 'toast-1', title: 'Updated title' },
      });
      expect(updated.toasts[0].title).toBe('Updated title');
    });

    it('does not affect non-matching toasts', () => {
      const state = reducer(reducer(emptyState, { type: 'ADD_TOAST', toast: sampleToast }), {
        type: 'ADD_TOAST',
        toast: { id: 'toast-2', title: 'Other', open: true },
      });
      const updated = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: 'toast-2', title: 'Changed' },
      });
      const unchanged = updated.toasts.find((t) => t.id === 'toast-1');
      expect(unchanged?.title).toBe('Producto agregado');
    });
  });

  describe('DISMISS_TOAST', () => {
    it('sets open: false for the targeted toast', () => {
      const state = reducer(emptyState, { type: 'ADD_TOAST', toast: sampleToast });
      const dismissed = reducer(state, { type: 'DISMISS_TOAST', toastId: 'toast-1' });
      expect(dismissed.toasts[0].open).toBe(false);
    });

    it('dismisses all toasts when no id is provided', () => {
      let state = reducer(emptyState, { type: 'ADD_TOAST', toast: { id: 'a', open: true } });
      state = reducer(state, { type: 'ADD_TOAST', toast: { id: 'b', open: true } });
      const dismissed = reducer(state, { type: 'DISMISS_TOAST' });
      expect(dismissed.toasts.every((t) => t.open === false)).toBe(true);
    });
  });

  describe('REMOVE_TOAST', () => {
    it('removes a specific toast by id', () => {
      const state = reducer(emptyState, { type: 'ADD_TOAST', toast: sampleToast });
      const removed = reducer(state, { type: 'REMOVE_TOAST', toastId: 'toast-1' });
      expect(removed.toasts).toHaveLength(0);
    });

    it('clears ALL toasts when no id is provided', () => {
      let state = reducer(emptyState, { type: 'ADD_TOAST', toast: { id: 'a', open: true } });
      state = reducer(state, { type: 'ADD_TOAST', toast: { id: 'b', open: true } });
      const cleared = reducer(state, { type: 'REMOVE_TOAST' });
      expect(cleared.toasts).toHaveLength(0);
    });
  });
});

// â”€â”€ toast() API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('toast() imperative API', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an id, dismiss, and update function', () => {
    const result = toast({ title: 'Test' });
    expect(typeof result.id).toBe('string');
    expect(typeof result.dismiss).toBe('function');
    expect(typeof result.update).toBe('function');
  });

  it('generates unique ids for each toast', () => {
    const a = toast({ title: 'A' });
    const b = toast({ title: 'B' });
    expect(a.id).not.toBe(b.id);
  });

  it('toast.success() is callable and returns dismiss/update', () => {
    const result = toast.success({ title: 'Guardado', description: 'Todo bien' });
    expect(typeof result.dismiss).toBe('function');
  });

  it('toast.error() is callable', () => {
    const result = toast.error({ title: 'Error de pago' });
    expect(typeof result.dismiss).toBe('function');
  });

  it('toast.warning() is callable', () => {
    const result = toast.warning({ title: 'Stock bajo' });
    expect(typeof result.dismiss).toBe('function');
  });
});
