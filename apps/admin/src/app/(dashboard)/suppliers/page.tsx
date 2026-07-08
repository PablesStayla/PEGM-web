import { getSuppliersAction } from '@/resources/suppliers/actions';
import { SupplierList } from '@/resources/suppliers/SupplierList';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const result = await getSuppliersAction();

  // result is expected to be from next-safe-action
  // result.data = { success, data: Supplier[] }

  const actionResult =
    typeof result === 'object' && result !== null && 'data' in result
      ? (result as { data?: any }).data
      : null;

  const suppliers =
    actionResult && typeof actionResult === 'object' && 'data' in actionResult
      ? (actionResult as { data?: any[] }).data
      : [];

  const serverError =
    typeof result === 'object' &&
    result !== null &&
    'serverError' in result &&
    typeof (result as any).serverError === 'string'
      ? ((result as any).serverError ?? null)
      : null;

  if (serverError) {
    return (
      <div className="flex h-100 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Error al cargar proveedores</p>
          <p className="text-sm text-gray-500">{serverError}</p>
        </div>
      </div>
    );
  }

  const supplierList = Array.isArray(suppliers) ? suppliers : [];

  return <SupplierList suppliers={supplierList} />;
}
