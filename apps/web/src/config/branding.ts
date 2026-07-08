/**
 * PranaKaia Branding Configuration
 *
 * This file contains all branding-related configuration including:
 * - Colors (psychological color system)
 * - Typography
 * - Logo and assets
 * - Brand guidelines
 * - Marketing copy
 * - Design tokens
 *
 * Based on psychology of color and conversion optimization
 */

export const BRANDING = {
  // Brand Identity
  name: 'PranaKaia',
  tagline: 'Lanzamiento Oficial 2026',
  description:
    'Grow Shop premium en Concepción, Chile. Cultivo indoor, hidroponía, iluminación LED, semillas y nutrientes para cultivadores de élite.',

  // Location Details
  location: {
    city: 'Concepción',
    region: 'Biobío',
    country: 'Chile',
    fullAddress: 'Concepción, Biobío, Chile',
    coordinates: {
      lat: -36.8201,
      lng: -73.0444,
    },
  },

  // Logo Configuration
  logo: {
    main: '/logos/pranakaia-logo-new.png', // Logo horizontal (light backgrounds)
    dark: '/logos/pranakaia-logo-new.png', // Logo horizontal (dark backgrounds)
    icon: '/logos/pranakaia-icon-new.png', // Isotipo circular
    favicon: '/logos/pranakaia-icon-new.png',
    appleTouchIcon: '/logos/pranakaia-icon-new.png',
    manifest: '/manifest.json',
  },

  // Psychological Color System (Forest & Gold Theme)
  colors: {
    // Primary Brand Colors (Forest Green)
    primary: {
      main: '#1a4d2e', // Forest Green - Premium, Trust, Nature
      light: '#2d6a4f', // Emerald forest accent
      dark: '#081c15', // Deep moss contrast
      contrast: '#c5a059', // Gold text on green
    },

    // Secondary Colors (Premium Gold)
    secondary: {
      main: '#c5a059', // Warm Gold - Matches Logo Accent
      light: '#e6ccb2', // Pale gold
      dark: '#7f5539', // Bronze/Ancient gold
      contrast: '#1a4d2e', // Forest green text on gold
    },

    // Trust & Professionalism
    info: {
      main: '#3b82f6', // Professional Blue - Trust, Calm, Reliability
      light: '#60a5fa',
      dark: '#2563eb',
      contrast: '#ffffff',
    },

    // Success & Growth
    success: {
      main: '#10b981', // Growth Green - Success, Achievement
      light: '#34d399',
      dark: '#059669',
      contrast: '#ffffff',
    },

    // Urgency & Attention
    warning: {
      main: '#f59e0b', // Energy Amber - Attention, Urgency
      light: '#fbbf24',
      dark: '#d97706',
      contrast: '#000000', // Black text on amber
    },

    // Error & Action Required
    error: {
      main: '#ef4444', // Action Red - Urgency, Action Required
      light: '#f87171',
      dark: '#dc2626',
      contrast: '#ffffff',
    },

    // Luxury & Sophistication
    neutral: {
      50: '#fafafa', // Pure white - Clean, Premium
      100: '#f5f5f5', // Off-white - Subtle luxury
      200: '#e5e5e5', // Light gray - Modern
      300: '#d4d4d4', // Medium light gray
      400: '#a3a3a3', // Medium gray - Balance
      500: '#737373', // Medium dark gray
      600: '#525252', // Dark gray - Authority
      700: '#404040', // Darker gray - Luxury
      800: '#262626', // Very dark gray - Power
      900: '#171717', // Almost black - Sophistication
      950: '#0a0a0a', // Pure black - Ultimate luxury
    },

    // Specialty Colors (From Logo Details)
    accent: {
      gold: '#d4af37', // Premium gold - main brand color
      amber: '#ea9c37', // Warm amber - from leaf accents in logo
      lightGreen: '#4ade80', // Light green - from cannabis leaves
      bronze: '#b8941f', // Bronze/dark gold - for subtle accents
    },
  },

  // Typography System (Psychology of Readability)
  typography: {
    // Font Families (Psychology-based selection)
    primary: {
      name: 'Inter',
      weights: [300, 400, 500, 600, 700],
      fallback: 'system-ui, -apple-system, sans-serif',
      psychology: 'Modern, trustworthy, professional',
    },

    secondary: {
      name: 'JetBrains Mono',
      weights: [400, 500, 600],
      fallback: 'monospace',
      psychology: 'Technical credibility, precision',
    },

    display: {
      name: 'Cal Sans',
      weights: [400, 500, 600, 700],
      fallback: 'Inter, system-ui, sans-serif',
      psychology: 'Bold, memorable, premium feel',
    },

    // Font Sizes (Psychological hierarchy)
    sizes: {
      xs: '0.75rem', // Fine print - Trust through transparency
      sm: '0.875rem', // Body small - Approachable
      base: '1rem', // Body - Comfortable reading
      lg: '1.125rem', // Body large - Important information
      xl: '1.25rem', // Subheadings - Clear hierarchy
      '2xl': '1.5rem', // Headings - Authority
      '3xl': '1.875rem', // Large headings - Impact
      '4xl': '2.25rem', // Hero text - Memorability
      '5xl': '3rem', // Mega headings - Brand presence
    },

    // Line Heights (Readability psychology)
    lineHeights: {
      tight: '1.25', // Headlines - Clean, modern
      normal: '1.5', // Body text - Comfortable reading
      relaxed: '1.75', // Featured content - Luxury feel
    },
  },

  // Spacing System (Psychology of breathing room)
  spacing: {
    // Generous spacing creates trust and luxury feel
    micro: '0.25rem', // 4px - Fine details
    tiny: '0.5rem', // 8px - Small elements
    small: '0.75rem', // 12px - Related elements
    medium: '1rem', // 16px - Component spacing
    large: '1.5rem', // 24px - Section spacing
    xl: '2rem', // 32px - Major sections
    '2xl': '3rem', // 48px - Page sections
    '3xl': '4rem', // 64px - Hero spacing
    '4xl': '6rem', // 96px - Dramatic spacing
  },

  // Marketing Copy (Psychology-based messaging)
  copy: {
    hero: {
      headline: 'Cultiva Tu Esencia',
      subheadline:
        'Todo para tu cultivo indoor: iluminación LED, carpas, semillas feminizadas, nutrientes orgánicos y equipamiento profesional',
      cta: 'Explorar Productos',
      trustSignals: [
        'Envío a todo Chile',
        'Productos 100% Originales',
        'Asesoría de Cultivo Gratis',
      ],
    },

    benefits: {
      quality: 'Equipamiento de grado profesional para cultivos de alto rendimiento',
      expertise: 'Te asesoramos en cada paso de tu cultivo',
      sustainability: 'Cultivo orgánico, sustentable y responsable',
      community: 'Únete a nuestra comunidad de cultivadores',
    },

    socialProof: {
      testimonials: 'Grow shop de confianza desde Concepción, Chile',
      certifications: 'Productos certificados y de origen garantizado',
      awards: 'Marcas líderes a nivel mundial en indoor growing',
    },
  },

  // Design Tokens (Atomic design system)
  tokens: {
    // Border Radius (Psychology of approachability)
    radius: {
      none: '0',
      sm: '0.125rem', // Sharp but friendly
      md: '0.375rem', // Approachable
      lg: '0.5rem', // Trustworthy
      xl: '0.75rem', // Premium feel
      full: '9999px', // Playful, modern
    },

    // Shadows (Psychology of depth and quality)
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // Subtle quality
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', // Professional depth
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', // Premium presence
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)', // Luxury elevation
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)', // Contained luxury
    },

    // Animations (Psychology of responsiveness)
    animations: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)', // Immediate response
      normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)', // Comfortable interaction
      slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)', // Luxurious feel
      bounce: '600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful engagement
    },
  },

  // Brand Guidelines
  guidelines: {
    logo: {
      minimumSize: '32px',
      clearSpace: '16px',
      colors: ['#22c55e', '#ffffff', '#000000'],
      usage: 'Always use on brand colors, never distort',
    },

    colors: {
      primary: 'Use for CTAs, links, and brand elements',
      secondary: 'Use for accents and secondary actions',
      success: 'Use for positive feedback and confirmations',
      warning: 'Use for important notices and cautions',
      error: 'Use for errors and destructive actions',
      neutral: 'Use for text, backgrounds, and subtle elements',
    },

    typography: {
      hierarchy: 'Inter for body, Display for headings, Mono for code',
      contrast: 'Always maintain 4.5:1 contrast ratio minimum',
      spacing: 'Use generous line spacing for luxury feel',
    },
  },

  // SEO Configuration
  seo: {
    defaultTitle: 'PranaKaia Grow Shop | E-Commerce Premium Concepción 2026',
    defaultDescription:
      'Gran lanzamiento 2026: Tu Grow Shop de élite en Concepción para todo Chile. Carpas de cultivo, iluminación LED de última generación, semillas y nutrientes orgánicos de alta gama.',
    siteName: 'PranaKaia Grow Shop',
    twitterHandle: '@pranakaia',
    ogImage: '/og/pranakaia-og.jpg',
    keywords: [
      'grow shop concepción 2026',
      'lanzamiento grow shop concepción',
      'grow shop chile premium',
      'cultivo indoor concepción',
      'semillas feminizadas concepción',
      'iluminación led cultivo',
      'carpas de cultivo',
      'nutrientes orgánicos',
      'hidroponía chile',
      'equipamiento indoor',
      'PranaKaia',
      'grow shop online',
    ],
  },

  // Social Media (add real URLs when accounts are created)
  social: {} as Record<string, string>,
} as const;

// Export types for TypeScript
export type BrandColors = typeof BRANDING.colors;
export type BrandTypography = typeof BRANDING.typography;
export type BrandSpacing = typeof BRANDING.spacing;
export type BrandTokens = typeof BRANDING.tokens;
