import type { Metadata } from "next";

/**
 * Layout raíz de la aplicación. Define el idioma del documento (es-CL) para
 * tecnologías de asistencia y los metadatos comunes a todas las rutas.
 */
export const metadata: Metadata = {
  title: {
    template: "%s · Pablo Garrido — Ingeniero Civil Metalúrgico",
    default: "Pablo Garrido — Ingeniero Civil Metalúrgico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <body>{children}</body>
    </html>
  );
}
