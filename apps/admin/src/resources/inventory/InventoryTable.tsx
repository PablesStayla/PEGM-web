'use client';

import {
  Badge,
  Button,
  cn,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@pranakaia/ui';
import { Loader2, Package, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateStockAction as updateStock } from '@/resources/inventory/actions';
import type { ProductWithDetails } from '@/resources/products/schemas';

type ProductWithCategory = ProductWithDetails;

export function InventoryTable({ products }: { products?: ProductWithCategory[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});

  const handleStockChange = (productId: string, value: string) => {
    const stock = Number.parseInt(value, 10) || 0;
    setEditingStock((prev) => ({ ...prev, [productId]: stock }));
  };

  const handleSaveStock = async (productId: string, productName: string) => {
    const newStock = editingStock[productId];
    if (newStock === undefined) {
      return;
    }

    setLoading(productId);
    try {
      const result = await updateStock({
        productId,
        quantity: newStock,
        reason: 'manual_adjustment',
      });

      if (result?.data) {
        toast({
          title: '✅ Stock actualizado',
          description: `Stock de "${productName}" actualizado a ${newStock}`,
        });
        router.refresh();
        setEditingStock((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
      } else {
        toast({
          variant: 'destructive',
          title: '❌ Error',
          description: 'No se pudo actualizar el stock',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'Ocurrió un error inesperado',
      });
    } finally {
      setLoading(null);
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex h-100 items-center justify-center rounded-xl border border-white/6 bg-[#161616]">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-600 mb-3" />
          <p className="text-lg font-semibold text-white">No hay productos</p>
          <p className="text-sm text-gray-500 mt-1">
            Los productos aparecerán aquí para gestionar inventario
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/6 bg-[#161616] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/6 hover:bg-transparent">
            <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
              Producto
            </TableHead>
            <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
              Categoría
            </TableHead>
            <TableHead className="text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">
              Stock Actual
            </TableHead>
            <TableHead className="text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">
              Nuevo Stock
            </TableHead>
            <TableHead className="text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">
              Estado
            </TableHead>
            <TableHead className="text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">
              Acción
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isEditing = editingStock[product.id] !== undefined;
            const currentStock = product.stockQuantity ?? 0;
            const displayStock = isEditing ? editingStock[product.id] : currentStock;
            const isLowStock = currentStock < 10 && currentStock > 0;
            const isOutOfStock = currentStock === 0;

            return (
              <TableRow
                key={product.id}
                className="border-b border-white/4 hover:bg-white/2 transition-colors"
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-white text-sm">{product.name}</span>
                    <span className="text-xs text-gray-500 font-mono">{product.slug}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-gray-300 border-white/12 bg-white/4 text-xs"
                  >
                    {product.category?.name || 'Sin categoría'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-semibold border',
                      isOutOfStock
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : isLowStock
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20',
                    )}
                  >
                    {currentStock}
                  </Badge>
                </TableCell>
                <TableCell className="w-32">
                  <Input
                    type="number"
                    min="0"
                    value={displayStock ?? ''}
                    onChange={(e) => handleStockChange(product.id, e.target.value)}
                    className="w-24 text-center bg-white/4 border-white/10 text-white placeholder-gray-500 focus:border-[#14b8a6]/40 h-9"
                  />
                </TableCell>
                <TableCell className="text-center">
                  {isOutOfStock ? (
                    <span className="text-sm font-medium text-red-400">Agotado</span>
                  ) : isLowStock ? (
                    <span className="text-sm font-medium text-orange-400">Stock Bajo</span>
                  ) : (
                    <span className="text-sm font-medium text-green-400">OK</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleSaveStock(product.id, product.name)}
                    disabled={!isEditing || loading === product.id}
                    className="bg-[#14b8a6] hover:bg-[#0f9f8f] text-black font-semibold disabled:opacity-40 h-8 text-xs"
                  >
                    {loading === product.id ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        Guardando
                      </>
                    ) : (
                      <>
                        <Save className="mr-1.5 h-3 w-3" />
                        Guardar
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
