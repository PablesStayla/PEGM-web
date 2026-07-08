'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useToast,
} from '@pranakaia/ui';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateOrderStatus } from '@/actions/admin-orders';
import type { OrderStatus } from '@/types/db';

interface OrderStatusSelectorProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PROCESSING', label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
  { value: 'SHIPPED', label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  { value: 'DELIVERED', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

export function OrderStatusSelector({ orderId, currentStatus }: OrderStatusSelectorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) {
      return;
    }

    setLoading(true);
    try {
      const result = await updateOrderStatus({ orderId, status: newStatus });

      if (!result?.data?.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Error al actualizar estado',
        });
        return;
      }

      toast({
        title: 'Éxito',
        description: `Orden actualizada a ${newStatus}`,
      });
      router.refresh();
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error inesperado',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading} className="min-w-35 justify-between">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            statusOptions.find((s) => s.value === currentStatus)?.label || currentStatus
          )}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            disabled={status.value === currentStatus}
          >
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
