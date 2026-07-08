/**
 * Configuración centralizada de direcciones de correo de PranaKaia
 * Este archivo define todas las direcciones de correo utilizadas en el sistema
 */

export const EMAIL_ADDRESSES = {
  // Correos principales del sistema (3 direcciones principales)
  NOREPLY: 'noreply@pranakaia.com', // Correos automáticos del sistema
  SUPPORT: 'support@pranakaia.com', // Soporte al cliente (tu correo principal)
  CONTACT: 'contact@pranakaia.com', // Contacto general (también tu correo)

  // Correos opcionales (para el futuro si los necesitas)
  SALES: 'sales@pranakaia.com',
  ADMIN: 'admin@pranakaia.com',
  MARKETING: 'marketing@pranakaia.com',
} as const;

const EMAIL_NAMES = {
  // Nombres para mostrar en los correos (3 principales)
  NOREPLY: 'PranaKaia',
  SUPPORT: 'PranaKaia Support',
  CONTACT: 'PranaKaia Contact',

  // Nombres opcionales (para el futuro)
  SALES: 'PranaKaia Sales',
  ADMIN: 'PranaKaia Admin',
  MARKETING: 'PranaKaia Marketing',
} as const;

const EMAIL_CONFIG = {
  // Configuración por defecto para envío de correos
  FROM: {
    email: EMAIL_ADDRESSES.NOREPLY,
    name: EMAIL_NAMES.NOREPLY,
  },

  // Configuración para diferentes tipos de correos
  TYPES: {
    // Correos automáticos del sistema
    SYSTEM: {
      from: EMAIL_ADDRESSES.NOREPLY,
      name: EMAIL_NAMES.NOREPLY,
    },

    // Correos de soporte
    SUPPORT: {
      from: EMAIL_ADDRESSES.SUPPORT,
      name: EMAIL_NAMES.SUPPORT,
    },

    // Correos de marketing
    MARKETING: {
      from: EMAIL_ADDRESSES.MARKETING,
      name: EMAIL_NAMES.MARKETING,
    },

    // Correos de ventas
    SALES: {
      from: EMAIL_ADDRESSES.SALES,
      name: EMAIL_NAMES.SALES,
    },
  },

  // Configuración de respuestas
  REPLY_TO: {
    SUPPORT: EMAIL_ADDRESSES.SUPPORT,
    CONTACT: EMAIL_ADDRESSES.CONTACT,
    SALES: EMAIL_ADDRESSES.SALES,
  },
} as const;

// Función helper para obtener la configuración de correo por tipo
export function getEmailConfig(type: keyof typeof EMAIL_CONFIG.TYPES) {
  return EMAIL_CONFIG.TYPES[type];
}

// Función helper para obtener dirección de correo por nombre
export function getEmailAddress(name: keyof typeof EMAIL_ADDRESSES) {
  return EMAIL_ADDRESSES[name];
}

// Función helper para obtener nombre de correo por nombre
export function getEmailName(name: keyof typeof EMAIL_NAMES) {
  return EMAIL_NAMES[name];
}

// Función helper para formatear correo completo (nombre <email>)
export function formatEmailAddress(name: keyof typeof EMAIL_ADDRESSES) {
  return `${EMAIL_NAMES[name]} <${EMAIL_ADDRESSES[name]}>`;
}
