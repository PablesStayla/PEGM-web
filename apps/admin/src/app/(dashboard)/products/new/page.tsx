import { ProductForm } from '@/resources/catalog/ProductForm';

export const metadata = {
  title: 'Nuevo Producto | Admin - PranaKaia',
  description: 'Agregar nuevo producto al catálogo',
};

export default function NewProductPage() {
  return <ProductForm />;
}
