import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

// Define a subset of Order type to avoid circular dependency with Prisma/Core
interface EmailOrderOrder {
  orderNumber: string;
  total: number;
  customer: {
    firstName: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: {
    street: string;
    city: string;
  };
}

export const OrderConfirmationEmail = ({
  order = {
    orderNumber: 'ORD-123',
    total: 59990,
    customer: { firstName: 'Pablo', email: 'test@example.com' },
    items: [{ name: 'Puffco Proxy', quantity: 1, price: 59990 }],
  } as EmailOrderOrder,
}: {
  order: EmailOrderOrder;
}) => {
  const previewText = `Tu orden #${order.orderNumber} ha sido confirmada`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://pranakaia.cl/logo.png"
                width="40"
                height="37"
                alt="PranaKaia"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              ¡Gracias por tu compra!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hola {order.customer.firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Hemos recibido tu orden <strong>#{order.orderNumber}</strong> y la estamos preparando
              para el envío.
            </Text>

            <Section>
              {order.items.map((item, index) => (
                <Text key={index} className="text-gray-500 text-[12px]">
                  {item.quantity}x {item.name} - ${item.price.toLocaleString('es-CL')}
                </Text>
              ))}
              <Hr />
              <Text className="font-bold">Total: ${order.total.toLocaleString('es-CL')}</Text>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              Te notificaremos cuando tu pedido sea enviado.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderConfirmationEmail;
