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

interface PasswordResetEmailProps {
  resetUrl: string;
  expiresIn?: string;
}

const PasswordResetEmail = ({
  resetUrl = 'https://pranakaia.com/reset-password?token=abc123',
  expiresIn = '1 hora',
}: PasswordResetEmailProps) => {
  const previewText = 'Restablece tu contraseña - PranaKaia';

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

          {/* Icon */}
          <Section style={iconSection}>
            <div style={iconCircle}>🔒</div>
          </Section>

          {/* Title */}
          <Heading style={h1}>Restablecer tu Contraseña</Heading>

          <Text style={text}>
            Recibimos una solicitud para restablecer la contraseña de tu cuenta PranaKaia.
          </Text>

          <Text style={text}>
            Haz clic en el botón a continuación para crear una nueva contraseña:
          </Text>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button style={button} href={resetUrl}>
              Restablecer Contraseña
            </Button>
          </Section>

          {/* Alternative Link */}
          <Text style={smallText}>
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </Text>
          <Text style={linkText}>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
          </Text>

          {/* Warning Box */}
          <Section style={warningBox}>
            <Text style={warningText}>
              ⏰ <strong>Este enlace expirará en {expiresIn}</strong>
            </Text>
            <Text style={warningSubtext}>
              Por razones de seguridad, si no usas este enlace dentro de {expiresIn}, deberás
              solicitar un nuevo restablecimiento de contraseña.
            </Text>
          </Section>

          {/* Security Notice */}
          <Section style={noticeBox}>
            <Heading as="h3" style={h3}>
              ¿No solicitaste esto?
            </Heading>
            <Text style={noticeText}>
              Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma
              segura. Tu contraseña actual seguirá siendo válida.
            </Text>
            <Text style={noticeText}>
              Si crees que alguien está intentando acceder a tu cuenta, te recomendamos cambiar tu
              contraseña de inmediato y contactar a nuestro equipo de soporte.
            </Text>
          </Section>

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Heading as="h3" style={h3}>
              💡 Consejos de Seguridad
            </Heading>
            <ul style={tipsList}>
              <li style={tipItem}>Usa una contraseña única que no uses en otros sitios</li>
              <li style={tipItem}>Combina letras mayúsculas, minúsculas, números y símbolos</li>
              <li style={tipItem}>Considera usar un administrador de contraseñas</li>
              <li style={tipItem}>Nunca compartas tu contraseña con nadie</li>
            </ul>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              ¿Necesitas ayuda?{' '}
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
            <Text style={footerTextSmall}>
              Este email fue enviado a tu dirección porque se solicitó un restablecimiento de
              contraseña para esta cuenta.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

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

const iconSection = {
  padding: '16px 0',
  textAlign: 'center' as const,
};

const iconCircle = {
  display: 'inline-block',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#fef3c7',
  fontSize: '40px',
  lineHeight: '80px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '24px 0',
  padding: '0 24px',
  textAlign: 'center' as const,
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 24px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const smallText = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  padding: '0 24px',
  margin: '24px 0 8px',
  textAlign: 'center' as const,
};

const linkText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  padding: '0 24px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  wordBreak: 'break-all' as const,
};

const buttonSection = {
  padding: '24px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 24px',
};

const warningText = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const warningSubtext = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '20px',
  margin: 0,
  textAlign: 'center' as const,
};

const noticeBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 24px',
};

const noticeText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px',
};

const tipsSection = {
  padding: '0 24px',
  margin: '24px 0',
};

const tipsList = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
  paddingLeft: '20px',
};

const tipItem = {
  marginBottom: '8px',
};

const link = {
  color: '#16a34a',
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
