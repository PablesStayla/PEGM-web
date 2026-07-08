import { requireAdmin } from '@pranakaia/infrastructure/auth';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { CommandCenter } from '@/components/layout/CommandCenter';

// Admin is a fully-authenticated, data-driven app — force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function checkAdminAccess(): Promise<boolean> {
  // Always validate real authenticated admin session.
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const hasAccess = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-prana-dark-green text-foreground transition-all duration-700 relative overflow-hidden">
      {/* Universal Background Ambience - STAFF Level War Room */}
      <div className="fixed inset-0 bg-mesh-forest opacity-15 pointer-events-none" />
      <div className="fixed inset-0 bg-noise opacity-5 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-tr from-black/80 via-transparent to-black/20 pointer-events-none" />

      <AdminSidebar />
      <CommandCenter />
      {/* pt-14 on mobile to account for fixed mobile header, lg:pt-0 for desktop */}
      <main className="flex-1 overflow-auto p-4 pt-18 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
