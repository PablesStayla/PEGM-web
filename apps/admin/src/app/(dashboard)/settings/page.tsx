import { requireAdmin } from '@pranakaia/infrastructure/auth';
import { stores, tenants } from '@pranakaia/infrastructure/db';
import { db } from '@/lib/db';
import { getAdminMfaSummary } from '@/lib/security/admin-mfa';
import { SettingsForm } from '@/resources/settings/SettingsForm';

export const metadata = {
  title: 'Configuración | Admin - PranaKaia',
  description: 'Configuración de la tienda',
};

export const dynamic = 'force-dynamic';

async function getStoreSettings() {
  try {
    const [tenantResult, storeResult] = await Promise.all([
      db.select().from(tenants).limit(1),
      db.select().from(stores).limit(1),
    ]);

    return {
      tenant: tenantResult[0] || null,
      store: storeResult[0] || null,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {
      tenant: null,
      store: null,
    };
  }
}

export default async function AdminSettingsPage() {
  const adminUser = await requireAdmin();
  if (!adminUser) {
    throw new Error('Unauthorized');
  }
  const { tenant, store } = await getStoreSettings();
  const security = await getAdminMfaSummary(adminUser.id);

  if (!tenant || !store) {
    return (
      <div className="flex flex-col h-100 items-center justify-center text-muted-foreground p-8 border border-dashed rounded-lg">
        <p className="font-semibold text-lg">Error de Datos</p>
        <p className="text-sm mt-1">No se pudo cargar la configuración de la tienda.</p>
        <p className="text-xs mt-4 text-red-500 font-mono">Verifica la DATABASE_URL</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <SettingsForm initialData={{ tenant, store, security }} />
    </div>
  );
}
