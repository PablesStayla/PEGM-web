import type { ChileanTestAddress } from './user-factory.types';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'FULFILLING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'flow' | 'stripe' | 'bank_transfer' | 'cash';

export interface ChileanAddress extends Omit<ChileanTestAddress, 'id' | 'isDefault' | 'street'> {
  name: string;
  street: string;
  phone: string;
}

export interface TestOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: 'CLP';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: ChileanAddress;
  billingAddress: ChileanAddress;
  notes: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderOptions {
  userId?: string;
  status?: OrderStatus;
  totalAmount?: number;
  itemsCount?: number;
}
