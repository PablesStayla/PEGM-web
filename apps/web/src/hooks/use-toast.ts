'use client';

/**
 * @file apps/web/src/hooks/use-toast.ts
 *
 * Radix-based toast queue with a global in-memory reducer.
 * Adapted from shadcn/ui — intentionally dependency-light.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast({ title: 'Producto agregado', description: 'Revisa tu carrito.' });
 */

import * as React from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

type ToastProps = {
  variant?: ToastVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type ToastActionElement = React.ReactElement;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  /** Auto-dismiss delay in milliseconds. Defaults to 5 000. Set to 0 to disable. */
  duration?: number;
};

// ── Constants ──────────────────────────────────────────────────────────────

/** Maximum toasts visible simultaneously */
const TOAST_LIMIT = 3;

/**
 * Delay before a dismissed toast is removed from the DOM.
 * Long enough for the exit animation to complete (matches CSS transition).
 */
const TOAST_REMOVE_DELAY_MS = 400;

/**
 * Default auto-dismiss duration in ms.
 * 0 = persistent (caller must dismiss manually).
 */
const DEFAULT_DURATION_MS = 5_000;

// ── Reducer ────────────────────────────────────────────────────────────────

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

type ActionType = typeof actionTypes;

type Action =
  | { type: ActionType['ADD_TOAST']; toast: ToasterToast }
  | { type: ActionType['UPDATE_TOAST']; toast: Partial<ToasterToast> }
  | { type: ActionType['DISMISS_TOAST']; toastId?: string }
  | { type: ActionType['REMOVE_TOAST']; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;
      if (toastId) {
        scheduleRemoval(toastId);
      } else {
        state.toasts.forEach((t) => {
          scheduleRemoval(t.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t,
        ),
      };
    }

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts:
          action.toastId === undefined ? [] : state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

// ── Global store ────────────────────────────────────────────────────────────

const removeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleRemoval(toastId: string): void {
  if (removeTimeouts.has(toastId)) {
    return;
  }
  const timer = setTimeout(() => {
    removeTimeouts.delete(toastId);
    dispatch({ type: 'REMOVE_TOAST', toastId });
  }, TOAST_REMOVE_DELAY_MS);
  removeTimeouts.set(toastId, timer);
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action): void {
  memoryState = reducer(memoryState, action);
  for (const listener of listeners) {
    listener(memoryState);
  }
}

// ── ID generator ────────────────────────────────────────────────────────────

let _counter = 0;
function genId(): string {
  _counter = (_counter + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${_counter}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

type ToastInput = Omit<ToasterToast, 'id'>;

function toast(props: ToastInput) {
  const id = genId();
  const duration = props.duration ?? DEFAULT_DURATION_MS;

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });
  const update = (next: ToasterToast) => dispatch({ type: 'UPDATE_TOAST', toast: { ...next, id } });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dismiss();
        }
      },
    },
  });

  // Auto-dismiss after duration (0 = persistent)
  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  return { id, dismiss, update };
}

/**
 * Convenience wrappers for common toast variants.
 *
 * @example
 * toast.success({ title: 'Producto agregado', description: '...' });
 * toast.error({ title: 'Error de pago' });
 */
toast.success = (props: Omit<ToastInput, 'variant'>) => toast({ ...props, variant: 'success' });

toast.error = (props: Omit<ToastInput, 'variant'>) => toast({ ...props, variant: 'destructive' });

toast.warning = (props: Omit<ToastInput, 'variant'>) => toast({ ...props, variant: 'warning' });

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) {
        listeners.splice(idx, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { toast, useToast };
