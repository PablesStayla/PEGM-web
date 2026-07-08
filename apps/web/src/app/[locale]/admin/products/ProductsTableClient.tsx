'use client';

import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@pranakaia/ui';
import { Edit, MoreVertical, Package, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { formatCLP } from '@/lib/format';
import { deleteProductBase, type getAdminProducts } from '../../actions/admin-products';

type AdminProduct = Awaited<ReturnType<typeof getAdminProducts>>[number];

export default function ProductsTableClient({ products }: { products: AdminProduct[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }
    setIsDeleting(id);
    await deleteProductBase(id);
    setIsDeleting(null);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
          <TableHead className="w-20">Imagen</TableHead>
          <TableHead>Producto & SKU</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              No hay productos encontrados en el catálogo.
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow
              key={product.id}
              className={`hover:bg-gray-50/50 dark:hover:bg-gray-900/50 ${isDeleting === product.id ? 'opacity-50' : ''}`}
            >
              <TableCell>
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-gray-400">{product.sku}</div>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {product.category || <span className="text-gray-400 italic">Sin categoría</span>}
              </TableCell>
              <TableCell className="font-medium">
                {formatCLP(product.salePrice?.amount ?? product.price.amount)}
              </TableCell>
              <TableCell>
                <span
                  className={`text-sm font-bold ${
                    product.stock <= 5
                      ? 'text-red-500' // Alerta de stock crítico
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {product.stock} un.
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="default"
                  className={`text-[10px] uppercase border-none ${
                    product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {product.isActive ? 'PUBLISHED' : 'DRAFT'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={() => handleDelete(product.id)}
                    disabled={isDeleting === product.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
