import type { ReactElement } from 'react';
import { Resend } from 'resend';
import { formatEmailAddress } from './email-config';
import { env } from './env';

// Lazy singleton para evitar errores en tests
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendInstance = new Resend(env.RESEND_API_KEY);
  }
  return resendInstance;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
}

async function sendEmail({
  to,
  subject,
  react,
  from = formatEmailAddress('NOREPLY'),
  replyTo,
}: SendEmailParams) {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      replyTo,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper para enviar email de confirmación de orden
export async function sendOrderConfirmation(
  email: string,
  orderData: {
    orderNumber: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingAddress: {
      address: string;
      city: string;
      country: string;
      postalCode: string;
    };
  },
) {
  const OrderConfirmationEmail = (await import('@/emails/OrderConfirmation')).default;

  return sendEmail({
    to: email,
    subject: `Confirmación de Orden #${orderData.orderNumber}`,
    react: OrderConfirmationEmail(orderData),
  });
}

// Helper para enviar actualización de envío
export async function sendShippingUpdate(
  email: string,
  shippingData: {
    orderNumber: string;
    status: 'processing' | 'shipped' | 'delivered';
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  },
) {
  const ShippingUpdateEmail = (await import('@/emails/ShippingUpdate')).default;

  return sendEmail({
    to: email,
    subject: `Actualización de Envío - Orden #${shippingData.orderNumber}`,
    react: ShippingUpdateEmail(shippingData),
  });
}

// Helper para enviar email de reset de contraseña
export async function sendPasswordReset(
  email: string,
  resetData: {
    resetUrl: string;
    expiresIn: string;
  },
) {
  const PasswordResetEmail = (await import('@/emails/PasswordReset')).default;

  return sendEmail({
    to: email,
    subject: 'Restablecer tu contraseña - PranaKaia',
    react: PasswordResetEmail(resetData),
  });
}

// Helper para notificar que la orden fue enviada al proveedor
export async function sendDropshipOrderSent(
  email: string,
  data: {
    orderNumber: string;
    supplierName: string;
    items: Array<{ name: string; quantity: number }>;
    estimatedDays?: number;
  },
) {
  const DropshipOrderSentEmail = (await import('@/emails/DropshipOrderSent')).default;

  return sendEmail({
    to: email,
    subject: `Tu orden #${data.orderNumber} está siendo procesada - PranaKaia`,
    react: DropshipOrderSentEmail(data),
  });
}

// Helper para enviar alerta de stock bajo (admin)
export async function sendLowStockAlert(
  adminEmail: string,
  data: {
    products: Array<{
      name: string;
      currentStock: number;
      threshold: number;
      supplierName: string;
    }>;
    totalAlerts: number;
  },
) {
  const LowStockAlertEmail = (await import('@/emails/LowStockAlert')).default;

  return sendEmail({
    to: adminEmail,
    subject: `⚠️ Alerta: ${data.totalAlerts} producto(s) con stock bajo - PranaKaia`,
    react: LowStockAlertEmail(data),
  });
}

// Helper para enviar email de carrito abandonado
export async function sendAbandonedCartEmail(
  email: string,
  data: {
    customerName?: string;
    items: Array<{ name: string; quantity: number; price: number; image?: string }>;
    total: number;
    recoveryUrl: string;
    discountCode?: string;
    discountPercent?: number;
  },
) {
  const AbandonedCartRecoveryEmail = (await import('@/emails/AbandonedCartRecovery')).default;

  return sendEmail({
    to: email,
    subject: `${data.customerName ?? 'Grower'}, ¡tu carrito te espera! 🌱 - PranaKaia`,
    react: AbandonedCartRecoveryEmail(data),
  });
}
