import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/inter";
import "./globals.css";
import { getSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
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
    ],
    openGraph: {
      title: `${settings.name} — ${settings.title}`,
      description: settings.tagline,
      type: "website",
      locale: "es_CL",
    },
  };
}

/**
 * Script anti-parpadeo: aplica el tema guardado antes de hidratar React.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
