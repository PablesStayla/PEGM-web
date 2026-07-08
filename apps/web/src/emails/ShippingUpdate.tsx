import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type * as React from 'react';
import { getSiteUrl } from '@/lib/site-url';

interface ShippingUpdateEmailProps {
  orderNumber: string;
  status: 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

const statusMessages = {
  processing: {
    title: '📦 Tu orden está siendo preparada',
    message: 'Estamos procesando tu orden y pronto estará lista para envío.',
    color: '#f59e0b',
  },
  shipped: {
    title: '🚚 Tu orden ha sido enviada',
    message: '¡Buenas noticias! Tu orden está en camino.',
    color: '#3b82f6',
  },
  delivered: {
    title: '✅ Tu orden ha sido entregada',
    message: '¡Tu orden ha llegado a destino! Esperamos que disfrutes tu compra.',
    color: '#16a34a',
  },
};

const ShippingUpdateEmail = ({
  orderNumber = 'ORD-123456',
  status = 'shipped',
  trackingNumber = 'TRK-987654321',
  trackingUrl = 'https://tracking.example.com/TRK-987654321',
  estimatedDelivery = '25 de Octubre, 2025',
}: ShippingUpdateEmailProps) => {
  const statusInfo = statusMessages[status];
  const previewText = `Actualización de envío - Orden #${orderNumber}`;
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

          {/* Status Badge */}
          <Section style={badgeSection}>
            <div style={{ ...statusBadge, backgroundColor: statusInfo.color }}>
              {statusInfo.title}
            </div>
          </Section>

          {/* Main Message */}
          <Heading style={h1}>{statusInfo.message}</Heading>

          <Text style={text}>
            Orden: <strong>#{orderNumber}</strong>
          </Text>

          {/* Tracking Info */}
          {status === 'shipped' && trackingNumber && (
            <Section style={trackingSection}>
              <Heading as="h2" style={h2}>
                Información de Seguimiento
              </Heading>

              <div style={trackingBox}>
                <Text style={trackingLabel}>Número de Seguimiento</Text>
                <Text style={trackingNumberStyle}>{trackingNumber}</Text>

                {estimatedDelivery && (
                  <>
                    <Text style={trackingLabel}>Entrega Estimada</Text>
                    <Text style={trackingValue}>{estimatedDelivery}</Text>
                  </>
                )}
              </div>

              {trackingUrl && (
                <Section style={buttonSection}>
                  <Button style={button} href={trackingUrl}>
                    Rastrear Paquete
                  </Button>
                </Section>
              )}
            </Section>
          )}

          {/* Delivery Timeline */}
          {status !== 'delivered' && (
            <Section style={timelineSection}>
              <Heading as="h3" style={h3}>
                Estado de tu Envío
              </Heading>

              <div style={timeline}>
                <div style={timelineItem}>
                  <div style={{ ...timelineDot, opacity: 1 }}>✓</div>
                  <div style={timelineContent}>
                    <Text style={timelineTitle}>Orden Confirmada</Text>
                    <Text style={timelineDesc}>Pago recibido</Text>
                  </div>
                </div>

                <div style={timelineConnector} />

                <div style={timelineItem}>
                  <div
                    style={{
                      ...timelineDot,
                      opacity: status === 'processing' || status === 'shipped' ? 1 : 0.3,
                    }}
                  >
                    {status === 'processing' || status === 'shipped' ? '✓' : '○'}
                  </div>
                  <div style={timelineContent}>
                    <Text style={timelineTitle}>Preparando Envío</Text>
                    <Text style={timelineDesc}>1-2 días hábiles</Text>
                  </div>
                </div>

                <div style={timelineConnector} />

                <div style={timelineItem}>
                  <div style={{ ...timelineDot, opacity: status === 'shipped' ? 1 : 0.3 }}>
                    {status === 'shipped' ? '✓' : '○'}
                  </div>
                  <div style={timelineContent}>
                    <Text style={timelineTitle}>En Tránsito</Text>
                    <Text style={timelineDesc}>3-5 días hábiles</Text>
                  </div>
                </div>

                <div style={timelineConnector} />

                <div style={timelineItem}>
                  <div style={{ ...timelineDot, opacity: 0.3 }}>○</div>
                  <div style={timelineContent}>
                    <Text style={timelineTitle}>Entregado</Text>
                    <Text style={timelineDesc}>Firma requerida</Text>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Delivered Message */}
          {status === 'delivered' && (
            <Section style={deliveredSection}>
              <Text style={deliveredText}>
                ✨ ¡Esperamos que disfrutes tu compra! Si tienes alguna pregunta sobre tu producto,
                no dudes en contactarnos.
              </Text>
              <Section style={buttonSection}>
                <Button style={button} href={`${siteUrl}/products`}>
                  Seguir Comprando
                </Button>
              </Section>
            </Section>
          )}

          {/* View Order */}
          <Section style={linkSection}>
            <Link href={`${siteUrl}/orders/${orderNumber}`} style={link}>
              Ver detalles completos de la orden →
            </Link>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              ¿Problemas con tu envío?{' '}
              <Link href="mailto:soporte@pranakaia.com" style={link}>
                Contáctanos
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

export default ShippingUpdateEmail;

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
  padding: '32px 24px 16px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const badgeSection = {
  padding: '0 24px',
  textAlign: 'center' as const,
  margin: '16px 0',
} as React.CSSProperties;

const statusBadge = {
  display: 'inline-block',
  padding: '8px 16px',
  borderRadius: '999px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '24px 0',
  padding: '0 24px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '16px 0 12px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 24px',
  margin: '8px 0',
  textAlign: 'center' as const,
};

const trackingSection = {
  padding: '0 24px',
  margin: '32px 0',
};

const trackingBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
};

const trackingLabel = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const trackingNumberStyle = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  margin: '0 0 24px',
};

const trackingValue = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '500' as const,
  margin: '0 0 16px',
};

const timelineSection = {
  padding: '0 24px',
  margin: '32px 0',
};

const timeline = {
  padding: '16px 0',
};

const timelineItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
};

const timelineDot = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#16a34a',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  flexShrink: 0,
};

const timelineConnector = {
  width: '2px',
  height: '24px',
  backgroundColor: '#e5e7eb',
  marginLeft: '15px',
};

const timelineContent = {
  flex: 1,
};

const timelineTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 4px',
};

const timelineDesc = {
  color: '#6b7280',
  fontSize: '14px',
  margin: 0,
};

const deliveredSection = {
  padding: '0 24px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const deliveredText = {
  color: '#1f2937',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonSection = {
  padding: '16px 0',
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

const linkSection = {
  padding: '0 24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#16a34a',
  fontSize: '14px',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 24px',
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
