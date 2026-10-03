import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/data";
import { FRAUNCES_600 } from "./og-font";

/**
 * Imagen Open Graph del sitio (1200×630), generada dinámicamente desde los
 * ajustes de la base de datos con la misma identidad visual del sitio:
 * papel cálido, serif Fraunces y acento cobre.
 *
 * - `revalidate`: se regenera cada hora (ISR), así los cambios del panel
 *   (nombre, título, etc.) terminan reflejándose.
 * - La fuente va embebida (ver ./og-font.ts) porque satori no soporta woff2.
 */

export const revalidate = 3600;
export const alt = "Presentación del sitio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const settings = await getSettings();

  return new ImageResponse(
    <div
      style={{
        ...size,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#faf7f2",
        padding: "72px 80px",
        backgroundImage:
          "linear-gradient(135deg, rgba(180,113,82,0.06) 0%, rgba(180,113,82,0) 45%)",
      }}
    >
      {/* encabezado */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 44, height: 4, backgroundColor: "#b47152" }} />
        <div
          style={{
            fontSize: 26,
            letterSpacing: 6,
            color: "#b47152",
            textTransform: "uppercase",
          }}
        >
          {settings.title}
        </div>
      </div>

      {/* nombre + tagline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Fraunces",
            fontSize: 168,
            color: "#1c1917",
            lineHeight: 1,
          }}
        >
          {settings.name}
          <span style={{ color: "#b47152" }}>.</span>
        </div>
        <div style={{ fontSize: 30, color: "#57534e", lineHeight: 1.4, maxWidth: 900 }}>
          {settings.tagline.slice(0, 150) + (settings.tagline.length > 150 ? "…" : "")}
        </div>
      </div>

      {/* pie */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #e7e0d8",
          paddingTop: 28,
          fontSize: 25,
          color: "#57534e",
        }}
      >
        <div style={{ display: "flex", gap: 32 }}>
          <div>{settings.location}</div>
          <div>{settings.email}</div>
        </div>
        <div
          style={{
            backgroundColor: "rgba(180,113,82,0.12)",
            color: "#b47152",
            padding: "10px 24px",
            borderRadius: 999,
            fontSize: 23,
          }}
        >
          {settings.availability}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Fraunces", data: FRAUNCES_600, weight: 600, style: "normal" }],
    },
  );
}
