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

interface LowStockAlertEmailProps {
  products: Array<{
    name: string;
    currentStock: number;
    threshold: number;
    supplierName: string;
  }>;
  totalAlerts: number;
}

const LowStockAlertEmail = ({
  products = [
    { name: 'LED Grow Light 600W', currentStock: 3, threshold: 10, supplierName: 'Green Supply' },
  ],
  totalAlerts = 1,
}: LowStockAlertEmailProps) => {
  const previewText = `⚠️ Alerta: ${totalAlerts} producto(s) con stock bajo`;

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

          <Heading style={h1}>⚠️ Alerta de Stock Bajo</Heading>

          <Text style={text}>
            Los siguientes productos han caído por debajo del umbral mínimo de stock y requieren
            atención:
          </Text>

          <Section style={tableSection}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Producto</th>
                  <th style={th}>Proveedor</th>
                  <th style={th}>Stock</th>
                  <th style={th}>Umbral</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr key={i}>
                    <td style={td}>{product.name}</td>
                    <td style={td}>{product.supplierName}</td>
                    <td
                      style={{
                        ...td,
                        ...stockCell,
                        color: product.currentStock === 0 ? '#dc2626' : '#c5a059',
                      }}
                    >
                      {product.currentStock}
                    </td>
                    <td style={td}>{product.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section style={actionBox}>
            <Text style={actionText}>
              💡 <strong>Acciones recomendadas:</strong>
            </Text>
            <Text style={actionItem}>1. Contactar al proveedor para reabastecer</Text>
            <Text style={actionItem}>2. Considerar deshabilitar productos sin stock</Text>
            <Text style={actionItem}>3. Revisar la configuración de alertas</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Esta alerta fue generada automáticamente por el sistema de monitoreo de inventario.
          </Text>

          <Text style={footerBrand}>PranaKaia — Dropshipping Engine</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default LowStockAlertEmail;

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
  maxWidth: '600px',
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
  color: '#c5a059',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '0 30px',
  margin: '30px 0 15px',
};

const text: React.CSSProperties = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '0 30px',
};

const tableSection: React.CSSProperties = {
  padding: '0 30px',
  margin: '15px 0',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const th: React.CSSProperties = {
  textAlign: 'left' as const,
  padding: '8px 12px',
  backgroundColor: '#1a4d2e',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
};

const td: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #e6ebf1',
  fontSize: '14px',
  color: '#333',
};

const stockCell: React.CSSProperties = {
  fontWeight: 'bold',
};

const actionBox: React.CSSProperties = {
  padding: '15px 30px',
  margin: '15px 30px',
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #c5a059',
  borderRadius: '4px',
};

const actionText: React.CSSProperties = {
  fontSize: '14px',
  color: '#333',
  margin: '0 0 8px',
};

const actionItem: React.CSSProperties = {
  fontSize: '13px',
  color: '#555',
  margin: '4px 0',
  paddingLeft: '8px',
};

const hr: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '30px 30px',
};

const footer: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '12px',
  padding: '0 30px',
};

const footerBrand: React.CSSProperties = {
  color: '#1a4d2e',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '10px 30px 0',
};
