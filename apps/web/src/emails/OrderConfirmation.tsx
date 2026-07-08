import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { getSiteUrl } from '@/lib/site-url';

interface OrderConfirmationEmailProps {
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
}

const OrderConfirmationEmail = ({
  orderNumber = 'ORD-123456',
  items = [
    { name: 'Spider Farmer SF-2000 LED', quantity: 1, price: 299990 },
    { name: 'Kit BioBizz Try-Pack Indoor', quantity: 2, price: 49990 },
  ],
  subtotal = 399970,
  shipping = 5000,
  tax = 76000,
  total = 480970,
  shippingAddress = {
    address: 'Av. Providencia 1234',
    city: 'Santiago',
    country: 'Chile',
    postalCode: '7500000',
  },
}: OrderConfirmationEmailProps) => {
  const previewText = `Confirmación de tu orden #${orderNumber}`;
  const siteUrl = getSiteUrl();

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://pranakaia.com/logo.png"
              width="150"
              height="50"
              alt="PranaKaia"
              style={logo}
            />
          </Section>

          {/* Title */}
          <Heading style={h1}>¡Gracias por tu compra!</Heading>
          <Text style={text}>
            Hemos recibido tu orden <strong>#{orderNumber}</strong> y la estamos procesando.
          </Text>

          {/* Order Summary */}
          <Section style={orderSection}>
            <Heading as="h2" style={h2}>
              Resumen de tu Orden
            </Heading>

            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemName}>
                  {item.name} <span style={quantity}>× {item.quantity}</span>
                </Column>
                <Column align="right" style={itemPrice}>
                  ${item.price.toLocaleString('es-CL')}
                </Column>
              </Row>
            ))}

            <Hr style={hr} />

            <Row style={totalRow}>
              <Column>Subtotal</Column>
              <Column align="right">${subtotal.toLocaleString('es-CL')}</Column>
            </Row>

            <Row style={totalRow}>
              <Column>Envío</Column>
              <Column align="right">
                {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-CL')}`}
              </Column>
            </Row>

            <Row style={totalRow}>
              <Column>IVA (19%)</Column>
              <Column align="right">${tax.toLocaleString('es-CL')}</Column>
            </Row>

            <Hr style={hr} />

            <Row style={totalRowBold}>
              <Column>
                <strong>Total</strong>
              </Column>
              <Column align="right">
                <strong>${total.toLocaleString('es-CL')} CLP</strong>
              </Column>
            </Row>
          </Section>

          {/* Shipping Address */}
          <Section style={addressSection}>
            <Heading as="h3" style={h3}>
              Dirección de Envío
            </Heading>
            <Text style={addressText}>
              {shippingAddress.address}
              <br />
              {shippingAddress.city}, {shippingAddress.country}
              <br />
              {shippingAddress.postalCode}
            </Text>
          </Section>

          {/* CTA */}
          <Section style={buttonSection}>
            <Button style={button} href={`${siteUrl}/orders/${orderNumber}`}>
              Ver Estado de Orden
            </Button>
          </Section>

          {/* Next Steps */}
          <Section style={infoSection}>
            <Heading as="h3" style={h3}>
              ¿Qué sigue?
            </Heading>
            <Text style={text}>
              1. <strong>Procesamiento:</strong> Estamos preparando tu orden (1-2 días hábiles)
              <br />
              2. <strong>Envío:</strong> Recibirás un email con el número de seguimiento
              <br />
              3. <strong>Entrega:</strong> Tu orden llegará en 3-5 días hábiles
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              ¿Tienes preguntas? Contáctanos en{' '}
              <Link href="mailto:soporte@pranakaia.com" style={link}>
                soporte@pranakaia.com
              </Link>
            </Text>
            <Text style={footerTextSmall}>
              PranaKaia - Grow Shop Premium
              <br />
              Santiago, Chile
              <br />
              <Link href="https://pranakaia.com" style={link}>
                www.pranakaia.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#16a34a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 24px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '16px 0 8px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 24px',
  margin: '16px 0',
};

const orderSection = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '24px 24px',
};

const itemRow = {
  padding: '12px 0',
};

const itemName = {
  color: '#1f2937',
  fontSize: '16px',
};

const quantity = {
  color: '#6b7280',
  fontSize: '14px',
  marginLeft: '8px',
};

const itemPrice = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '500' as const,
};

const totalRow = {
  padding: '8px 0',
  color: '#6b7280',
  fontSize: '14px',
};

const totalRowBold = {
  padding: '16px 0 0',
  color: '#1f2937',
  fontSize: '18px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const addressSection = {
  padding: '0 24px',
  margin: '24px 0',
};

const addressText = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const buttonSection = {
  padding: '0 24px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const infoSection = {
  padding: '0 24px',
  margin: '24px 0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const footerTextSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '8px 0',
};

const link = {
  color: '#16a34a',
  textDecoration: 'underline',
};
