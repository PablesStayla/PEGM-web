'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@pranakaia/ui';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { updateOrderStatus } from '@/actions/admin-orders';

interface UpdateStatusDialogProps {
  order: { id: string; status: string; orderNumber: string };
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export function UpdateStatusDialog({ order, open, onOpenChangeAction }: UpdateStatusDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>(order.status);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateOrderStatus({
        orderId: order.id,
        status: status as
          | 'PENDING'
          | 'PAID'
          | 'PROCESSING'
          | 'FULFILLING'
          | 'SHIPPED'
          | 'DELIVERED'
          | 'CANCELLED'
          | 'REFUNDED'
          | 'FAILED',
        trackingNumber: trackingNumber || undefined,
        trackingUrl: trackingUrl || undefined,
      });

      if (result?.serverError) {
        toast({
          variant: 'destructive',
          title: '❌ Error',
          description: String(result.serverError),
        });
        return;
      }

      const data = (result as { data?: { success: boolean } })?.data;
      if (data?.success) {
        const emailNotificationSent =
          (data as { data?: { emailNotificationSent?: boolean } })?.data?.emailNotificationSent ??
          false;

        toast({
          title: '✅ Estado actualizado',
          description: emailNotificationSent
            ? `La orden ha sido actualizada a ${status} y se notifico al cliente.`
            : `La orden ha sido actualizada a ${status}. No se pudo enviar el email de notificacion.`,
        });

        onOpenChangeAction(false);
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: '❌ Error',
          description: 'No se pudo actualizar la orden',
        });
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'Ocurrió un error inesperado',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Actualizar Estado de Orden</DialogTitle>
            <DialogDescription>
              Orden: <strong>{order.orderNumber}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status Select */}
            <div className="space-y-2">
              <Label htmlFor="status">Nuevo Estado</Label>
              <Select value={status} onValueChange={(val) => setStatus(val)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">📋 Pendiente</SelectItem>
                  <SelectItem value="PROCESSING">⚙️ Procesando</SelectItem>
                  <SelectItem value="SHIPPED">🚚 Enviado</SelectItem>
                  <SelectItem value="DELIVERED">✅ Entregado</SelectItem>
                  <SelectItem value="CANCELLED">❌ Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Number (si es SHIPPED o DELIVERED) */}
            {(status === 'SHIPPED' || status === 'DELIVERED') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tracking">Número de Seguimiento (opcional)</Label>
                  <Input
                    id="tracking"
                    placeholder="TRK-123456789"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tracking-url">URL de Seguimiento (opcional)</Label>
                  <Input
                    id="tracking-url"
                    type="url"
                    placeholder="https://correo.cl/seguimiento/..."
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                  />
                </div>

                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  💡 La información de seguimiento se guardará en la orden y se intentará notificar
                  al cliente por email.
                </div>
              </>
            )}

            {/* Cancelled Warning */}
            {status === 'CANCELLED' && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                ⚠️ Esta acción cancelará la orden e intentará notificar al cliente por email.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChangeAction(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Estado'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
