import { Badge, Card, Switch } from '@pranakaia/ui';
import { Globe, HardDrive, Layers, Zap } from 'lucide-react';
import type { FormData } from '../types';

interface PerformanceTabProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function PerformanceTab({ formData, setFormData }: PerformanceTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-zinc-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap className="h-20 w-20 text-amber-500" />
        </div>
        <div className="mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold uppercase tracking-wider">Aceleración y Edge</h2>
            <p className="text-xs text-zinc-500">Configuración de cómputo en el borde</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100 transition-all hover:bg-zinc-100">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-400" /> Partial Prerendering (PPR)
              </label>
              <p className="text-xs text-zinc-500">
                Streaming dinámico con esqueletos estáticos ultra-rápidos (Next.js 15).
              </p>
            </div>
            <Switch
              checked={formData.pprEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, pprEnabled: checked }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <h3 className="text-xs font-bold text-blue-900 flex items-center gap-2 uppercase tracking-tighter">
                <Globe className="h-3 w-3" /> Global Edge Network
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <Badge className="bg-blue-500 text-white border-none text-[9px]">ACTIVE</Badge>
                <span className="text-[10px] text-blue-700 font-mono">Anycast IP Enabled</span>
              </div>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2 uppercase tracking-tighter">
                <HardDrive className="h-3 w-3" /> Cache Tiering
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <Badge className="bg-amber-500 text-white border-none text-[9px]">OPTIMIZED</Badge>
                <span className="text-[10px] text-amber-700 font-mono">SWR: 3600s</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
