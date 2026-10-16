import { chromium } from "@playwright/test";

// Ejecutar con el servidor local activo. El CV maestro nunca se publica ni modifica.
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" ? { channel: "msedge" } : {}),
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const base = process.env.CV_BASE_URL ?? "http://localhost:3000";
  await page.goto(new URL("/cv", base).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print", colorScheme: "light", reducedMotion: "reduce" });
  // El tema explícito evita exportar colores oscuros de las preferencias del sistema.
  await page.evaluate(() => { document.documentElement.classList.remove("dark"); });
  await page.pdf({
    path: "public/cv-pablo-garrido.pdf",
    format: "A4",
    margin: { top: "18mm", bottom: "18mm", left: "12mm", right: "12mm" },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: '<div style="font-size:9px;text-align:center;width:100%;color:#666">Pablo Garrido · Ingeniero Civil Metalúrgico · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  console.log("CV público actualizado: public/cv-pablo-garrido.pdf");
} finally {
  await browser.close();
}
