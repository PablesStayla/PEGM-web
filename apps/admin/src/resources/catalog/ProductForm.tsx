'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@pranakaia/ui';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Loader2,
  Save,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { createProduct, getCategories } from '@/actions/admin-products';
import { ImageUpload } from '@/components/shared/ImageUpload';

type CreateProductInput = {
  name: string;
  slug: string;
  description?: string | undefined;
  shortDescription?: string | undefined;
  basePrice: number;
  salePrice?: number | undefined;
  costPrice?: number | undefined;
  sku: string;
  stockQuantity: number;
  lowStockThreshold?: number | undefined;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured?: boolean | undefined;
  categoryId: string;
  images?: string[] | undefined;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type Category = { id: string; name: string; slug: string };

interface ProductFormProps {
  initialData?: any; // To be used for editing later
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    basePrice: initialData?.basePrice?.toString() || '',
    salePrice: initialData?.salePrice?.toString() || '',
    costPrice: initialData?.costPrice?.toString() || '',
    sku: initialData?.sku || '',
    stockQuantity: initialData?.stockQuantity?.toString() || '0',
    lowStockThreshold: initialData?.lowStockThreshold?.toString() || '5',
    status: (initialData?.status || 'DRAFT') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    isFeatured: initialData?.isFeatured || false,
    categoryId: initialData?.categoryId || '',
    images: (initialData?.images as string[]) || [],
  });

  useEffect(() => {
    getCategories({}).then((res: any) => {
      if (res?.data?.success && res?.data?.data) {
        setCategories(res.data.data as Category[]);
      }
    });
  }, []);

  // Auto-generate slug from name only when creating
  useEffect(() => {
    if (!isEdit && form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [form.name, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!form.sku.trim()) {
      setError('El SKU es obligatorio');
      return;
    }
    if (!form.basePrice || Number(form.basePrice) <= 0) {
      setError('El precio base debe ser mayor a 0');
      return;
    }
    if (!form.categoryId) {
      setError('La categoría es obligatoria');
      return;
    }

    const input: CreateProductInput = {
      name: form.name.trim(),
      slug: form.slug || slugify(form.name),
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      basePrice: Number(form.basePrice),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      sku: form.sku.trim(),
      stockQuantity: Number(form.stockQuantity) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 5,
      status: form.status,
      isFeatured: form.isFeatured,
      categoryId: form.categoryId,
      images: form.images.length > 0 ? form.images : undefined,
    };

    startTransition(async () => {
      // In a real scenario, we might use updateProduct if isEdit is true
      const result = await createProduct(input);
      if (result?.data?.success) {
        setSuccess(true);
        setTimeout(() => router.push('/products'), 1500);
      } else {
        setError(result?.serverError ?? 'Error al procesar producto');
      }
    });
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEdit
                ? 'Actualiza los detalles del producto'
                : 'Agrega un nuevo producto al catálogo maestro'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <p className="flex items-center gap-2 text-green-400 font-medium">
              <CheckCircle className="h-4 w-4" />
              Acción completada exitosamente. Redirigiendo...
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <p className="flex items-center gap-2 text-red-400 font-medium">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <Card className="bg-[#161616] border-white/6">
              <CardHeader className="border-b border-white/6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-400">
                      Nombre del Producto *
                    </label>
                    <Input
                      id="name"
                      className="bg-white/5 border-white/10 text-white"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Ej: Spider Farmer SF-4000 LED"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="slug" className="text-sm font-medium text-gray-400">
                      Slug (URL)
                    </label>
                    <Input
                      id="slug"
                      className="bg-white/5 border-white/10 text-white font-mono text-xs"
                      value={form.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="spider-farmer-sf-4000-led"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="shortDesc" className="text-sm font-medium text-gray-400">
                    Descripción Corta
                  </label>
                  <Input
                    id="shortDesc"
                    className="bg-white/5 border-white/10 text-white"
                    value={form.shortDescription}
                    onChange={(e) => updateField('shortDescription', e.target.value)}
                    placeholder="Descripción breve para SEO y listados rápidos"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-400">
                    Descripción Completa
                  </label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe las características técnicas, beneficios y especificaciones..."
                    rows={6}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inventory & SKU */}
            <Card className="bg-[#161616] border-white/6">
              <CardHeader className="border-b border-white/6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Layers className="h-5 w-5 text-primary" />
                  Inventario y SKU
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="sku" className="text-sm font-medium text-gray-400">
                    SKU *
                  </label>
                  <Input
                    id="sku"
                    className="bg-white/5 border-white/10 text-white font-mono"
                    value={form.sku}
                    onChange={(e) => updateField('sku', e.target.value)}
                    placeholder="PK-SF4000-01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stock" className="text-sm font-medium text-gray-400">
                    Stock Inicial
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    className="bg-white/5 border-white/10 text-white"
                    value={form.stockQuantity}
                    onChange={(e) => updateField('stockQuantity', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lowStock" className="text-sm font-medium text-gray-400">
                    Alerta Stock Bajo
                  </label>
                  <Input
                    id="lowStock"
                    type="number"
                    min="0"
                    className="bg-white/5 border-white/10 text-white"
                    value={form.lowStockThreshold}
                    onChange={(e) => updateField('lowStockThreshold', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="bg-[#161616] border-white/6">
              <CardHeader className="border-b border-white/6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Galería de Imágenes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ImageUpload
                  value={form.images}
                  onChange={(val) => updateField('images', val)}
                  multiple
                  maxFiles={8}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="bg-[#161616] border-white/6">
              <CardHeader className="border-b border-white/6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Tag className="h-5 w-5 text-primary" />
                  Precios
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="basePrice" className="text-sm font-medium text-gray-400">
                    Precio Base (CLP) *
                  </label>
                  <Input
                    id="basePrice"
                    type="number"
                    className="bg-white/5 border-white/10 text-white"
                    value={form.basePrice}
                    onChange={(e) => updateField('basePrice', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="salePrice" className="text-sm font-medium text-gray-400">
                    Precio Oferta (CLP)
                  </label>
                  <Input
                    id="salePrice"
                    type="number"
                    className="bg-white/5 border-white/10 text-white"
                    value={form.salePrice}
                    onChange={(e) => updateField('salePrice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="costPrice" className="text-sm font-medium text-gray-400">
                    Costo de Adquisición
                  </label>
                  <Input
                    id="costPrice"
                    type="number"
                    className="bg-white/5 border-white/10 text-white"
                    value={form.costPrice}
                    onChange={(e) => updateField('costPrice', e.target.value)}
                  />
                </div>

                {form.basePrice && form.costPrice && Number(form.costPrice) > 0 && (
                  <div className="pt-2 border-t border-white/6">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Margen Bruto Estimado:</span>
                      <span className="text-green-500 font-bold">
                        {((1 - Number(form.costPrice) / Number(form.basePrice)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categorization & Status */}
            <Card className="bg-[#161616] border-white/6">
              <CardHeader className="border-b border-white/6">
                <CardTitle className="text-lg font-semibold text-white">Publicación</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-gray-400">
                    Estado
                  </label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="DRAFT" className="bg-[#161616]">
                      Borrador
                    </option>
                    <option value="PUBLISHED" className="bg-[#161616]">
                      Publicado
                    </option>
                    <option value="ARCHIVED" className="bg-[#161616]">
                      Archivado
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-gray-400">
                    Categoría
                  </label>
                  <select
                    id="category"
                    value={form.categoryId}
                    onChange={(e) => updateField('categoryId', e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="" className="bg-[#161616]">
                      Sin categoría
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#161616]">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.isFeatured}
                    onChange={(e) => updateField('isFeatured', e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer">
                    Producto Destacado
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Submit Action */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    {isEdit ? 'Actualizar Producto' : 'Crear Producto'}
                  </>
                )}
              </Button>
              <Button asChild variant="ghost" className="w-full text-gray-400 hover:text-white">
                <Link href="/products">Cancelar</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
