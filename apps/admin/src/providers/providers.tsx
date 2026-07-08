/**
 * Composition root for all admin providers.
 *
 * This is the **only** component the root `layout.tsx` needs to know about.
 * It mounts (in order):
 *
 *   1. ThemeProvider          — next-themes (dark/light)
 *   2. NuqsAdapter            — URL state for filters/pagination
 *   3. ClientAbilityBoundary  — hydrates CASL ability from server session
 *   4. Toaster                — error/success toasts (consumes AdminUIError)
 *
 * Server Components above this boundary can call `serverAuthProvider` directly;
 * client components consume `useAbility()` / `<Can>` from CASL.
 *
 * @module providers/providers
 */

import { Toaster } from '@pranakaia/ui';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type ReactNode, Suspense } from 'react';
import { defineAbilitiesFor, serialiseAbility } from '@/providers/access-control';
import { getServerSession, type SessionUser } from '@/providers/auth';
import { ClientAbilityBoundary } from '@/providers/client-ability-boundary';
import { ThemeProvider } from '@/providers/theme-provider';

interface AdminProvidersProps {
  children: ReactNode;
}

/**
 * Server Component. Reads the session, builds the CASL ability, and serialises
 * it for hydration in the client `<AbilityProvider>`.
 */
export async function AdminProviders({ children }: AdminProvidersProps) {
  const session: SessionUser | null = await getServerSession();
  const ability = defineAbilitiesFor(session);
  const serialised = serialiseAbility(ability);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <NuqsAdapter>
        <Suspense fallback={null}>
          <ClientAbilityBoundary serialised={serialised}>{children}</ClientAbilityBoundary>
          <Toaster />
        </Suspense>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
