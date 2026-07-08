import {
  Body,
  Button,
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

interface PaymentRecoveryEmailProps {
  customerFirstName: string;
  orderNumber: string;
  couponCode: string;
  discountPct: number;
  recoveryUrl: string;
}

export const PaymentRecoveryEmail = ({
  customerFirstName = 'Pablo',
  orderNumber = 'ORD-123',
  couponCode = 'LAZARO10',
  discountPct = 10,
  recoveryUrl = 'https://pranakaia.cl/checkout',
}: PaymentRecoveryEmailProps) => {
  const previewText = `No dejes pasar tu pedido #${orderNumber}`;

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
              Casi lo tienes...
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">Hola {customerFirstName},</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Notamos que hubo un problema con el pago de tu orden <strong>#{orderNumber}</strong>.
              ¡No te preocupes! El stock sigue reservado para ti por poco tiempo.
            </Text>

            <Section className="bg-[#f9f9f9] p-[20px] rounded my-[24px] text-center">
              <Text className="text-[16px] font-bold my-0">
                Usa este código para un {discountPct}% de descuento extra:
              </Text>
              <Text className="text-[24px] font-mono font-bold text-[#1a4d2e] my-[10px]">
                {couponCode}
              </Text>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#1a4d2e] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={recoveryUrl}
              >
                Completar mi pedido ahora
              </Button>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Si tienes dudas o necesitas ayuda con tu pago, responde a este correo o contáctanos
              por WhatsApp.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PaymentRecoveryEmail;
