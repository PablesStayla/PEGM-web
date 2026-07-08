import { Card, Input } from '@pranakaia/ui';
import { Search } from 'lucide-react';
import type { FormData } from '../types';

interface MarketingTabProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function MarketingTab({ formData, setFormData }: MarketingTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-zinc-200 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Search className="h-5 w-5 text-zinc-900" />
          <h2 className="text-lg font-semibold uppercase tracking-wider">SEO Global</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prefijo de Título</label>
            <Input
              placeholder="Ej: PranaKaia | "
              value={formData.seo.titlePrefix}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, titlePrefix: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Meta Descripción</label>
            <Input
              placeholder="Descripción para Google..."
              value={formData.seo.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, description: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">GTM ID (Google Tag Manager)</label>
            <Input
              placeholder="GTM-XXXXXXX"
              value={formData.seo.gtmId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, gtmId: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
