'use client';

import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@pranakaia/ui';
import { Edit, Eye, MoreHorizontal, Package, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteProduct, toggleProductActive } from '@/actions/admin-products';
import { SortableHeader } from '@/components/shared/SortableHeader';
import type { ProductWithDetails } from '@/resources/products/schemas';
import { EditProductDialog } from './EditProductDialog';

type ProductWithCategory = ProductWithDetails;

interface ProductsTableProps {
  products: ProductWithCategory[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleToggleActive = async (productId: string) => {
    const result = await toggleProductActive({ productId });
    if (result?.data?.success) {
      toast({
        title: '✅ Producto actualizado',
        description: 'El estado del producto ha sido actualizado',
      });
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: result?.serverError ?? 'No se pudo actualizar el producto',
      });
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex h-100 items-center justify-center rounded-xl border border-white/6 bg-[#161616]">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-600 mb-3" />
          <p className="text-lg font-semibold text-white">No hay productos</p>
          <p className="text-sm text-gray-500 mt-1">Crea tu primer producto para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-white/6 bg-[#161616] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/6 hover:bg-transparent">
              <TableHead className="w-18 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Imagen
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                <SortableHeader field="name">Producto</SortableHeader>
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Categoría
              </TableHead>
              <TableHead className="text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">
                <SortableHeader field="basePrice" className="justify-end">
                  Precio
                </SortableHeader>
              </TableHead>
              <TableHead className="text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">
                <SortableHeader field="stockQuantity" className="justify-center">
                  Stock
                </SortableHeader>
              </TableHead>
              <TableHead className="text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Reseñas
              </TableHead>
              <TableHead className="text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Activo
              </TableHead>
              <TableHead className="text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const stock = product.stockQuantity || 0;
              const isLowStock = stock < 10 && stock > 0;
              const isOutOfStock = stock === 0;
              // Images are not fetched in list query — use placeholder
              const mainImage: string | null = null;

              return (
                <TableRow
                  key={product.id}
                  className="border-b border-white/4 hover:bg-white/2 transition-colors"
                >
                  {/* Image */}
                  <TableCell>
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/8 bg-white/4">
                      {mainImage ? (
                        <Image src={mainImage} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-white text-sm">{product.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{product.slug}</span>
                      {product.isFeatured && (
                        <Badge
                          variant="outline"
                          className="mt-1 w-fit text-xs text-[#14b8a6] border-[#14b8a6]/30 bg-[#14b8a6]/10"
                        >
                          ⭐ Destacado
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-gray-300 border-white/12 bg-white/4 text-xs"
                    >
                      {product.category?.name || 'Sin Categoría'}
                    </Badge>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right font-semibold text-[#14b8a6]">
                    ${Number(product.basePrice).toLocaleString('es-CL')}
                  </TableCell>

                  {/* Stock */}
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
                      {stock}
                    </Badge>
                  </TableCell>

                  {/* Reviews */}
                  <TableCell className="text-center text-sm text-gray-400">0</TableCell>

                  {/* Active Toggle */}
                  <TableCell className="text-center">
                    <Switch
                      checked={product.status === 'PUBLISHED'}
                      onCheckedChange={() => handleToggleActive(product.id)}
                      className="data-[state=checked]:bg-[#14b8a6]"
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/6"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1a1a1a] border-white/8 text-white"
                      >
                        <DropdownMenuLabel className="text-gray-400 text-xs uppercase tracking-wider">
                          Acciones
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/6" />
                        <DropdownMenuItem asChild className="hover:bg-white/6 cursor-pointer">
                          <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer">
                            <Eye className="mr-2 h-4 w-4 text-gray-400" />
                            Ver en tienda
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:bg-white/6 cursor-pointer"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4 text-gray-400" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/6" />
                        <DropdownMenuItem
                          className="hover:bg-red-500/10 cursor-pointer text-red-400 hover:text-red-300"
                          onClick={async () => {
                            const confirmed = window.confirm(
                              `¿Eliminar "${product.name}"? El producto será archivado.`,
                            );
                            if (!confirmed) {
                              return;
                            }
                            const result = await deleteProduct({ productId: product.id });
                            if (result?.data?.success) {
                              toast({
                                title: '🗑️ Producto archivado',
                                description: `"${product.name}" ha sido archivado`,
                              });
                              router.refresh();
                            } else {
                              toast({
                                variant: 'destructive',
                                title: '❌ Error',
                                description: result?.serverError ?? 'No se pudo eliminar',
                              });
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedProduct && (
        <EditProductDialog
          product={selectedProduct}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </>
  );
}
