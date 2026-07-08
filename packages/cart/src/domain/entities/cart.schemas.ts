import type { CustomerId, SessionId } from '@pranakaia/shared-kernel';
import { z } from 'zod';
import { CartValidationError } from './cart.errors';
import type { CartId } from './cart-id.vo';

/** Zod schema used by {@link Cart.create} to validate incoming props. */
export const CreateCartSchema = z
  .object({
    id: z.any(), // Validated at VO level
    customerId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional(),
    currency: z.string().length(3).default('USD'),
    expiresAt: z.date().optional(),
    // Items validated at entity level via instanceof check to avoid circular imports
    items: z.array(z.any()).optional(),
  })
  .refine((data) => data.customerId || data.sessionId, {
    message: 'Either customerId or sessionId must be provided',
    path: ['customerId', 'sessionId'],
  });

/** Input shape for {@link Cart.create}. */
export interface CreateCartProps {
  id: CartId;
  customerId?: CustomerId | string | undefined;
  sessionId?: SessionId | string | undefined;
  currency?: string | undefined;
  expiresAt?: Date | undefined;
  items?: import('./cart-item.vo').CartItem[] | undefined;
}

export function buildCartValidationError(error: z.ZodError): CartValidationError {
  const firstError = error.errors[0];
  const message = firstError?.message || 'Invalid props';
  return new CartValidationError(message, { errors: error.errors });
}

export function getCartExpiry(dataExpiresAt: Date | undefined): Date {
  return dataExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}
