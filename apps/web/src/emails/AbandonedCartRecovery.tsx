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
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface AbandonedCartEmailProps {
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  total: number;
  recoveryUrl: string;
  discountCode?: string;
  discountPercent?: number;
}

const AbandonedCartRecoveryEmail = ({
  customerName = 'Grower',
  items = [
    { name: 'Spider Farmer SF-2000 LED', quantity: 1, price: 299990 },
    { name: 'Kit BioBizz Try-Pack Indoor', quantity: 2, price: 49990 },
  ],
  total = 399970,
  recoveryUrl = 'https://pranakaia.com/checkout/recover/abc123',
  discountCode,
  discountPercent,
}: AbandonedCartEmailProps) => {
  const previewText = `${customerName}, tu carrito te espera en PranaKaia 🌱`;

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
          <Heading style={h1}>¡Tu carrito te espera! 🌱</Heading>
          <Text style={text}>
            Hola <strong>{customerName}</strong>, notamos que dejaste algunos productos increíbles
            en tu carrito. ¡No dejes que se te escapen!
          </Text>

          {/* Items */}
          <Section style={orderSection}>
            <Heading as="h2" style={h2}>
              Productos en tu carrito
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
              <Column>
                <strong>Total estimado</strong>
              </Column>
              <Column align="right">
                <strong style={totalPrice}>${total.toLocaleString('es-CL')}</strong>
              </Column>
            </Row>
          </Section>

          {/* Discount Code */}
          {discountCode && discountPercent && (
            <Section style={discountSection}>
              <Text style={discountText}>
                🎁 ¡Tenemos un regalo para ti! Usa el código{' '}
                <strong style={discountCodeStyle}>{discountCode}</strong> y obtén un{' '}
                <strong>{discountPercent}%</strong> de descuento en tu compra.
              </Text>
            </Section>
          )}

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={recoveryUrl}>
              Completar mi compra →
            </Button>
          </Section>

          <Text style={subText}>
            Los productos en tu carrito tienen stock limitado. Te recomendamos completar tu compra
            pronto para asegurar disponibilidad.
          </Text>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>PranaKaia — Tu grow shop de confianza en Chile 🇨🇱</Text>
            <Text style={footerSmall}>
              Si no deseas recibir estos recordatorios, puedes{' '}
              <a href="https://pranakaia.com/unsubscribe" style={link}>
                darte de baja aquí
              </a>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AbandonedCartRecoveryEmail;

// ── Styles ──────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const header = {
  padding: '24px 32px',
  backgroundColor: '#15803d',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700' as const,
  lineHeight: '36px',
  margin: '24px 32px 8px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600' as const,
  margin: '0 0 16px',
};

const text = {
  color: '#444',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 32px 24px',
  textAlign: 'center' as const,
};

const orderSection = {
  padding: '24px 32px',
  backgroundColor: '#fafafa',
  borderRadius: '8px',
  margin: '0 24px 24px',
};

const itemRow = {
  padding: '8px 0',
};

const itemName = {
  color: '#333',
  fontSize: '14px',
};

const quantity = {
  color: '#888',
  fontSize: '13px',
};

const itemPrice = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '600' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const totalRow = {
  padding: '8px 0',
};

const totalPrice = {
  color: '#15803d',
  fontSize: '18px',
};

const discountSection = {
  padding: '16px 24px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '0 24px 24px',
  border: '1px dashed #f59e0b',
};

const discountText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
};

const discountCodeStyle = {
  backgroundColor: '#ffffff',
  padding: '2px 8px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '16px',
  letterSpacing: '2px',
  color: '#d97706',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 32px 24px',
};

const ctaButton = {
  backgroundColor: '#15803d',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '700' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 32px',
};

const subText = {
  color: '#888',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 32px 24px',
  textAlign: 'center' as const,
};

const footer = {
  padding: '16px 32px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666',
  fontSize: '13px',
  margin: '0 0 8px',
};

const footerSmall = {
  color: '#999',
  fontSize: '11px',
  margin: '0',
};

const link = {
  color: '#15803d',
  textDecoration: 'underline',
};
