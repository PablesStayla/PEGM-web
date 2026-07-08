'use client';

import { Card, Input, Switch } from '@pranakaia/ui';
import { Layers, MapPin, Tag, Truck } from 'lucide-react';
import type { FormData } from '../types';

interface ShippingTabProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function ShippingTab({ formData, setFormData }: ShippingTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-zinc-200 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Truck className="h-5 w-5 text-zinc-900" />
          <h2 className="text-lg font-semibold uppercase tracking-wider">Logística Regional</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-zinc-900 text-white rounded-lg border border-zinc-800 shadow-lg">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-prana-gold" /> Despacho Local Concepción
              </label>
              <p className="text-xs text-zinc-400">
                Tarifa plana $0 para Concepción, Talcahuano y San Pedro de la Paz.
              </p>
            </div>
            <Switch
              checked={formData.shipping.localDeliveryConcepcion}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  shipping: { ...prev.shipping, localDeliveryConcepcion: checked },
                }))
              }
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" /> Envío Gratis desde (CLP)
            </label>
            <Input
              type="number"
              value={formData.shipping.freeShippingThreshold}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  shipping: { ...prev.shipping, freeShippingThreshold: Number(e.target.value) },
                }))
              }
            />
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Configuración actual: Compras sobre $
              {formData.shipping.freeShippingThreshold.toLocaleString('es-CL')} envían sin costo
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4" /> Tarifario por Zona
            </h3>
            <div className="space-y-3">
              {formData.shipping.zones.map((zone, idx) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between p-3 bg-zinc-50 border rounded-md"
                >
                  <span className="text-sm font-medium">{zone.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">$</span>
                    <input
                      type="number"
                      className="w-20 bg-transparent text-sm font-bold border-none p-0 focus:ring-0"
                      value={zone.price}
                      onChange={(e) => {
                        const newZones = [...formData.shipping.zones];
                        const targetZone = newZones[idx];
                        if (targetZone) {
                          targetZone.price = Number(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            shipping: { ...prev.shipping, zones: newZones },
                          }));
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
