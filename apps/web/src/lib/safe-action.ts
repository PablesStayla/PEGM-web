import { requireAuth } from '@pranakaia/infrastructure/auth';
import { createSafeActionClient } from 'next-safe-action';

export const actionClient = createSafeActionClient();

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await requireAuth();
  return next({ ctx: { user } });
});
