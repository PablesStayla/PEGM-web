import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  PAID: 'Pagado',
  REFUNDED: 'Reembolsado',
  FAILED: 'Fallido',
};

export interface OrderStatusUpdateEmailProps {
  orderNumber: string;
  status: string;
  customerName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export const OrderStatusUpdateEmail = ({
  orderNumber,
  status,
  customerName = 'cliente',
  trackingNumber,
  trackingUrl,
}: OrderStatusUpdateEmailProps) => {
  const statusLabel = STATUS_LABELS[status] ?? status;
  const preview = `Tu orden #${orderNumber} ahora esta ${statusLabel.toLowerCase()}`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Actualizacion de tu orden
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">Hola {customerName},</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Tu orden <strong>#{orderNumber}</strong> cambio a estado{' '}
              <strong>{statusLabel}</strong>.
            </Text>

            {trackingNumber ? (
              <Section>
                <Text className="text-black text-[14px] leading-[24px]">
                  Numero de seguimiento: <strong>{trackingNumber}</strong>
                </Text>
                {trackingUrl ? (
                  <Button
                    className="bg-black rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={trackingUrl}
                  >
                    Ver seguimiento
                  </Button>
                ) : null}
              </Section>
            ) : null}

            <Text className="text-black text-[14px] leading-[24px] mt-[24px]">
              Gracias por comprar en PranaKaia.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderStatusUpdateEmail;
