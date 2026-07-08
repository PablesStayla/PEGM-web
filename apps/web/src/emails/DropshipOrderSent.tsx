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
  Text,
} from '@react-email/components';
import type * as React from 'react';

interface DropshipOrderSentEmailProps {
  orderNumber: string;
  supplierName: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  estimatedDays?: number;
}

const DropshipOrderSentEmail = ({
  orderNumber = 'ORD-123456',
  supplierName = 'Green Supply Co.',
  items = [{ name: 'LED Grow Light 600W', quantity: 1 }],
  estimatedDays = 5,
}: DropshipOrderSentEmailProps) => {
  const previewText = `Tu orden #${orderNumber} ha sido enviada al proveedor`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://pranakaia.com/logo.png"
              width="150"
              height="50"
              alt="PranaKaia"
              style={logo}
            />
          </Section>

          <Heading style={h1}>Tu orden está en proceso 📦</Heading>

          <Text style={text}>
            Hola, te informamos que tu orden <strong>#{orderNumber}</strong> ha sido enviada a
            nuestro proveedor <strong>{supplierName}</strong> para su preparación y despacho.
          </Text>

          <Section style={orderSection}>
            <Text style={sectionTitle}>Productos en esta orden:</Text>
            {items.map((item, i) => (
              <Text key={i} style={itemText}>
                • {item.name} × {item.quantity}
              </Text>
            ))}
          </Section>

          {estimatedDays && (
            <Section style={infoBox}>
              <Text style={infoText}>
                ⏱️ Tiempo estimado de despacho: <strong>{estimatedDays} días hábiles</strong>
              </Text>
              <Text style={infoTextSmall}>
                Recibirás un email con el número de seguimiento cuando tu pedido sea despachado.
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            Si tienes preguntas, responde a este email o contáctanos en support@pranakaia.com
          </Text>

          <Text style={footerBrand}>PranaKaia — Tu tienda de cultivo indoor</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default DropshipOrderSentEmail;

// --- Styles ---
const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '580px',
};

const header: React.CSSProperties = {
  padding: '20px 30px',
  backgroundColor: '#1a4d2e',
  textAlign: 'center' as const,
};

const logo: React.CSSProperties = {
  margin: '0 auto',
};

const h1: React.CSSProperties = {
  color: '#1a4d2e',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '0 30px',
  margin: '30px 0 15px',
};

const text: React.CSSProperties = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 30px',
};

const orderSection: React.CSSProperties = {
  padding: '15px 30px',
  margin: '10px 30px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#666',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
};

const itemText: React.CSSProperties = {
  fontSize: '15px',
  color: '#333',
  margin: '4px 0',
};

const infoBox: React.CSSProperties = {
  padding: '15px 30px',
  margin: '15px 30px',
  backgroundColor: '#f0f7f4',
  borderLeft: '4px solid #1a4d2e',
  borderRadius: '4px',
};

const infoText: React.CSSProperties = {
  fontSize: '15px',
  color: '#1a4d2e',
  margin: '0 0 5px',
};

const infoTextSmall: React.CSSProperties = {
  fontSize: '13px',
  color: '#666',
  margin: '0',
};

const hr: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '30px 30px',
};

const footer: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '13px',
  padding: '0 30px',
};

const footerBrand: React.CSSProperties = {
  color: '#1a4d2e',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '10px 30px 0',
};
