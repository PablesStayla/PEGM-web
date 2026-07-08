import { requireAdmin } from '@pranakaia/infrastructure/auth';
import { createSafeActionClient } from 'next-safe-action';

const actionClient = createSafeActionClient();

export const adminActionClient = actionClient.use(async ({ next }) => {
  const user = await requireAdmin();
  return next({ ctx: { user } });
});
