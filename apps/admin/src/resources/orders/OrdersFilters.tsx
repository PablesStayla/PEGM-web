'use client';

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@pranakaia/ui';
import { Download, Loader2, Search } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useState } from 'react';
import { exportAdminOrdersCsv } from '@/actions/admin-orders';

export function OrdersFilters() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useQueryState('search', {
    shallow: false,
    throttleMs: 500,
    defaultValue: '',
  });
  const [status, setStatus] = useQueryState('status', { shallow: false, defaultValue: 'all' });
  const [payment, setPayment] = useQueryState('payment', { shallow: false, defaultValue: 'all' });
  const [sortBy] = useQueryState('sortBy', { shallow: false, defaultValue: 'createdAt' });
  const [sortOrder] = useQueryState('sortOrder', { shallow: false, defaultValue: 'desc' });

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);

      const result = await exportAdminOrdersCsv({
        search: search || undefined,
        status,
        paymentStatus: payment,
        sortBy,
        sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      });

      if (result?.serverError) {
        toast({
          variant: 'destructive',
          title: 'No se pudo exportar',
          description: String(result.serverError),
        });
        return;
      }

      const payload = (
        result as {
          data?: {
            success?: boolean;
            error?: string;
            data?: {
              csvContent: string;
              filename: string;
              exportedCount: number;
              truncated: boolean;
            };
          };
        }
      )?.data;

      if (!payload?.success || !payload?.data) {
        toast({
          variant: 'destructive',
          title: 'No se pudo exportar',
          description: payload?.error || 'Error desconocido al exportar CSV',
        });
        return;
      }

      const blob = new Blob([payload.data.csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = downloadUrl;
      anchor.download = payload.data.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);

      toast({
        title: 'CSV exportado',
        description: `Se exportaron ${payload.data.exportedCount} órdenes.`,
      });

      if (payload.data.truncated) {
        toast({
          title: 'Exportación parcial',
          description: 'La exportación se limitó a 5000 órdenes para evitar bloqueos.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al exportar CSV',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/6 bg-[#161616] p-4">
      {/* Search */}
      <div className="relative flex-1 min-w-50">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Buscar por # orden o email..."
          className="pl-10 bg-white/4 border-white/10 text-white placeholder-gray-500 focus:border-[#14b8a6]/40 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value || null)}
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={(value) => setStatus(value === 'all' ? null : value)}>
        <SelectTrigger className="w-45 bg-white/4 border-white/10 text-gray-300 focus:border-[#14b8a6]/40 h-10">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/8 text-white">
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="PENDING">Pendiente</SelectItem>
          <SelectItem value="PROCESSING">Procesando</SelectItem>
          <SelectItem value="SHIPPED">Enviado</SelectItem>
          <SelectItem value="DELIVERED">Entregado</SelectItem>
          <SelectItem value="CANCELLED">Cancelado</SelectItem>
        </SelectContent>
      </Select>

      {/* Payment Status Filter */}
      <Select value={payment} onValueChange={(value) => setPayment(value === 'all' ? null : value)}>
        <SelectTrigger className="w-45 bg-white/4 border-white/10 text-gray-300 focus:border-[#14b8a6]/40 h-10">
          <SelectValue placeholder="Pago" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/8 text-white">
          <SelectItem value="all">Todos los pagos</SelectItem>
          <SelectItem value="PENDING">Pendiente</SelectItem>
          <SelectItem value="PAID">Pagado</SelectItem>
          <SelectItem value="FAILED">Fallido</SelectItem>
          <SelectItem value="REFUNDED">Reembolsado</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void handleExportCsv();
        }}
        disabled={isExporting}
        className="h-10 border-white/10 bg-white/4 text-white hover:bg-white/10"
      >
        {isExporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </>
        )}
      </Button>
    </div>
  );
}
