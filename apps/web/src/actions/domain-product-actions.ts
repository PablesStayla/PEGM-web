import { ProductService } from '@pranakaia/catalog';
import { db } from '@pranakaia/infrastructure/db';
import { z } from 'zod';
import { DrizzleProductRepository } from '../infrastructure/repositories/drizzle-product-repository';

const productRepository = new DrizzleProductRepository();
const productService = new ProductService(productRepository, async (fn) => db.transaction(fn));

export async function getProductsAction() {
  const products = await productService.listProducts({ limit: 50 });
  return { success: true, data: products };
}

const createProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  stockQuantity: z.number(),
});

export async function createProductAction(input: z.input<typeof createProductSchema>) {
  const parsedInput = createProductSchema.parse(input);

  const skuPrefix = parsedInput.name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 6)
    .padEnd(6, 'X');
  const sku = `${skuPrefix}-${Date.now().toString(36).toUpperCase()}`;

  const product = await productService.createProduct({
    name: parsedInput.name,
    description: parsedInput.description ?? '',
    price: {
      amount: parsedInput.price,
      currency: 'CLP',
    },
    stock: parsedInput.stockQuantity,
    sku,
    images: [],
  });

  return { success: true, data: product };
}
