export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(_payload: EmailPayload): Promise<EmailResult> {
  return { success: true, messageId: 'mock-message-id' };
}

export function OrderStatusUpdateEmail({
  orderNumber,
  status,
}: {
  orderNumber: string;
  status: string;
}) {
  return {
    subject: `Order ${orderNumber} status updated to ${status}`,
    html: `<p>Your order ${orderNumber} is now ${status}</p>`,
  };
}

export function OrderConfirmationEmail({ orderNumber }: { orderNumber: string }) {
  return {
    subject: `Order ${orderNumber} confirmed`,
    html: `<p>Thank you for your order ${orderNumber}</p>`,
  };
}

export function WelcomeEmail({ userName }: { userName: string }) {
  return {
    subject: 'Welcome!',
    html: `<p>Welcome ${userName}</p>`,
  };
}

export function PaymentRecoveryEmail({ amount }: { amount: number }) {
  return {
    subject: 'Payment recovery',
    html: `<p>Please complete your payment of $${amount}</p>`,
  };
}
