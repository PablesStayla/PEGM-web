import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/inter";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: "/" },
    title: {
      default: `${settings.name} — ${settings.title}`,
      template: `%s — ${settings.name}, ${settings.title}`,
    },
    description: settings.tagline,
    keywords: [
      "Ingeniero Civil Metalúrgico",
      "metalurgia",
      "procesamiento de minerales",
      "flotación",
      "hidrometalurgia",
      "Chile",
      "Pablo Garrido",
      "ingeniero de procesos",
      "ingeniero de proyectos",
      "CFD",
      "OpenFOAM",
      "ANSYS Fluent",
      "METSIM",
      "analítica de datos",
    ],
    openGraph: {
      title: `${settings.name} — ${settings.title}`,
      description: settings.tagline,
      type: "website",
      locale: "es_CL",
      url: "/",
    },
  };
}

/** Datos estructurados schema.org (Person + WebSite) para buscadores. */
async function structuredData() {
  const settings = await getSettings();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: settings.name,
        description: settings.tagline,
        inLanguage: "es-CL",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: settings.name,
        jobTitle: settings.title,
        description: settings.tagline,
        url: SITE_URL,
        email: `mailto:${settings.email}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: settings.location,
          addressCountry: "CL",
        },
        sameAs: [settings.linkedin, settings.github].filter(Boolean),
        image: `${SITE_URL}/pablo-garrido-sin-reflejo.png`,
        alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad de Concepción" },
        knowsAbout: [
          "Ingeniería metalúrgica",
          "CFD",
          "Hidrometalurgia",
          "METSIM",
          "Analítica de datos",
        ],
      },
    ],
  };
}

/**
 * Script anti-parpadeo: aplica el tema guardado antes de hidratar React.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = await structuredData();
  return (
    <html lang="es-CL" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: script inline anti-parpadeo del tema (sin origen externo)
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="bg-bg font-sans text-ink antialiased">
        {children}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD de schema.org generado desde la base de datos
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
