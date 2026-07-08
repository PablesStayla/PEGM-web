'use client';

import { Badge, Card, Input } from '@pranakaia/ui';
import { Building2, RefreshCcw, Store } from 'lucide-react';
import type { FormData } from '../types';

interface GeneralTabProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  tenant: { plan?: string };
}

export function GeneralTab({ formData, setFormData, tenant }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-zinc-200 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <Building2 size={80} />
        </div>
        <div className="mb-6 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-zinc-900" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold uppercase tracking-wider">Organización</h2>
            <p className="text-xs text-zinc-500">Datos legales y contractuales</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Razón Social</label>
            <Input
              value={formData.tenantName}
              onChange={(e) => setFormData((prev) => ({ ...prev, tenantName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nivel de Soporte SLA</label>
            <div className="flex items-center gap-2 pt-2">
              <Badge
                variant="default"
                className="bg-zinc-900 text-gold border-none font-bold px-3 py-1"
              >
                {tenant?.plan === 'ENTERPRISE' ? 'PLATINUM 24/7' : 'ENTERPRISE Tier 3'}
              </Badge>
              <span className="text-[10px] text-zinc-400 font-mono tracking-tighter">
                Válido hasta Dic 2026
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-zinc-200 shadow-sm relative overflow-hidden">
        <div className="mb-6 flex items-center gap-2">
          <Store className="h-5 w-5 text-zinc-900" />
          <h2 className="text-lg font-semibold uppercase tracking-wider">Tienda</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre de la Instancia</label>
            <Input
              value={formData.storeName}
              onChange={(e) => setFormData((prev) => ({ ...prev, storeName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Moneda del Libro Mayor</label>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))
                }
                maxLength={3}
              />
              <div className="flex items-center gap-1 bg-zinc-50 px-3 rounded-md border text-xs font-mono">
                <RefreshCcw className="h-3 w-3 animate-spin text-zinc-400" />
                BCC: Fixed
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Maestro de Contacto</label>
            <Input
              placeholder="admin@pranakaia.cl"
              value={formData.contactEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
