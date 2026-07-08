// Países donde el cannabis es legal o despenalizado
const legalCountries = [
  'CL', // Chile
  'CA', // Canadá
  'NL', // Países Bajos
  'DE', // Alemania
  'LU', // Luxemburgo
  'MT', // Malta
  'MX', // México (uso medicinal)
  'AR', // Argentina (uso personal)
  'CO', // Colombia (uso personal)
  'PE', // Perú (uso medicinal)
  'EC', // Ecuador (uso personal)
  'CR', // Costa Rica (despenalizado)
  'JM', // Jamaica
  'ZA', // Sudáfrica
  'AU', // Australia (uso medicinal)
  'NZ', // Nueva Zelanda (despenalizado)
  'PT', // Portugal (despenalizado)
  'ES', // España (uso privado)
  'CH', // Suiza (CBD)
  'AT', // Austria (CBD)
  'IT', // Italia (CBD)
  'CZ', // República Checa (uso personal)
  'GE', // Georgia
  'NO', // Noruega (uso medicinal)
  'DK', // Dinamarca (uso medicinal)
  'FI', // Finlandia (uso medicinal)
  'PL', // Polonia (uso medicinal)
];

// Obtener idiomas soportados
export const locales = ['es', 'en', 'pt', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];

// Función para verificar si el país tiene acceso legal
export function isCountryLegal(countryCode: string): boolean {
  return legalCountries.includes(countryCode.toUpperCase());
}

// Función para obtener el mensaje de restricción por país
export function getRestrictionMessage(locale: Locale): string {
  const messages = {
    es: 'Lo sentimos, nuestros productos no están disponibles en tu región debido a restricciones legales.',
    en: 'Sorry, our products are not available in your region due to legal restrictions.',
    pt: 'Desculpe, nossos produtos não estão disponíveis em sua região devido a restrições legais.',
    fr: 'Désolé, nos produits ne sont pas disponibles dans votre région en raison de restrictions légales.',
    de: 'Entschuldigung, unsere Produkte sind in Ihrer Region aufgrund gesetzlicher Beschränkungen nicht verfügbar.',
  };

  return messages[locale] || messages.es;
}
