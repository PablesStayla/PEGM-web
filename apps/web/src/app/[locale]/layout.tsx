import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { FloatingCartButton } from '@/components/layout/FloatingCartButton';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SlideOverCart } from '@/components/layout/slide-over-cart';
import { BRANDING } from '@/config/branding';
import { routing } from '@/i18n/routing';
import { getActiveStore } from '@/lib/data/store';
import { isProd } from '@/lib/env';
import { getSiteUrlObject } from '@/lib/site-url';
import { Providers } from '@/providers';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['500', '600', '700', '800'],
});

/** Allow-list for Google Tag Manager container IDs (avoid XSS via DB-stored gtmId) */
const SAFE_GTM_ID_RE = /^GTM-[A-Z0-9]{4,10}$/;

/** Strip anything outside CSS custom-property safe chars to prevent CSS injection */
function sanitizeCssValue(value: string): string {
  return value.replace(/[^a-zA-Z0-9#%().\s,_-]/g, '');
}

function isSupportedLocale(locale: string): locale is (typeof routing.locales)[number] {
  return (routing.locales as readonly string[]).includes(locale);
}

export const metadata: Metadata = {
  title: BRANDING.seo.defaultTitle,
  description: BRANDING.seo.defaultDescription,
  keywords: [...BRANDING.seo.keywords] as string[],
  authors: [{ name: BRANDING.seo.siteName }],
  creator: BRANDING.seo.siteName,
  publisher: BRANDING.seo.siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: getSiteUrlObject(),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: BRANDING.seo.defaultTitle,
    description: BRANDING.seo.defaultDescription,
    url: '/',
    siteName: BRANDING.seo.siteName,
    images: [
      {
        url: BRANDING.seo.ogImage,
        width: 1200,
        height: 630,
        alt: 'PranaKaia Grow - Cultivo Indoor Premium en Chile',
      },
    ],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRANDING.seo.defaultTitle,
    description: BRANDING.seo.defaultDescription,
    creator: BRANDING.seo.twitterHandle,
    images: [BRANDING.seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();
  const storeData = await getActiveStore();
  const settings = storeData?.settings;

  // Dynamic Branding Styles — values sanitized to prevent CSS injection
  const dynamicStyles = settings?.branding
    ? `:root{--primary:${sanitizeCssValue(settings.branding.primaryColor || BRANDING.colors.primary.main)};--radius:${sanitizeCssValue(settings.branding.borderRadius || '0.5rem')}}`
    : '';
  const gtmId = settings?.seo?.gtmId;
  const hasValidGtmId = Boolean(gtmId && SAFE_GTM_ID_RE.test(gtmId));

  return (
    <html lang={locale} className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Dynamic SEO & Branding Overrides */}
        {settings?.seo?.description && (
          <meta name="description" content={settings.seo.description} />
        )}
        {hasValidGtmId ? (
          <Script id="gtm-loader" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        ) : null}
        <style>{dynamicStyles}</style>

        {/* Favicon */}
        <link rel="icon" type="image/jpeg" href={BRANDING.logo.favicon} />
        <link rel="apple-touch-icon" href={BRANDING.logo.appleTouchIcon} />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* PWA Manifest */}
        <link rel="manifest" href={BRANDING.logo.manifest} />

        {/* Theme Color */}
        <meta
          name="theme-color"
          content={settings?.branding?.primaryColor || BRANDING.colors.primary.main}
        />
        <meta
          name="msapplication-TileColor"
          content={settings?.branding?.primaryColor || BRANDING.colors.primary.main}
        />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <Providers locale={locale} messages={messages}>
          <NuqsAdapter>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="grow">{children}</main>
              <Footer />
              <FloatingCartButton />
              <SlideOverCart />
            </div>
          </NuqsAdapter>
        </Providers>
        {isProd() ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
