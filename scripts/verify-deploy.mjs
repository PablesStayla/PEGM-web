#!/usr/bin/env node
/**
 * Verificación de humo post-deploy.
 *
 *   node scripts/verify-deploy.mjs https://tu-dominio.cl
 *
 * Comprueba que el sitio desplegado esté sano: páginas públicas, imagen OG,
 * sitemap, robots.txt, JSON-LD, protección del panel y headers de seguridad.
 * Sale con código 1 si algo falla. Solo usa fetch (Node 18+).
 */

const url = process.argv[2];
if (!url) {
  console.error("Uso: node scripts/verify-deploy.mjs https://tu-dominio.cl");
  process.exit(1);
}
const base = url.replace(/\/+$/, "");

const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const fallo = (msg) => console.log(`  \x1b[31m✗\x1b[0m ${msg}`);

let errores = 0;

async function pedir(ruta, { redirect = "follow" } = {}) {
  const respuesta = await fetch(`${base}${ruta}`, { redirect });
  return respuesta;
}

async function comprobar(nombre, fn) {
  try {
    const resultado = await fn();
    if (resultado === true) ok(nombre);
    else {
      fallo(`${nombre} → ${resultado}`);
      errores++;
    }
  } catch (error) {
    fallo(`${nombre} → ${error.message}`);
    errores++;
  }
}

console.log(`\nVerificando ${base} …\n`);

await comprobar("Portada responde 200", async () => {
  const r = await pedir("/");
  if (r.status !== 200) return `HTTP ${r.status}`;
  const html = await r.text();
  return html.includes("Ingeniero Civil Metalúrgico") ? true : "falta el contenido esperado";
});

for (const ruta of ["/en", "/cv", "/proyectos", "/laboratorio", "/cv-pablo-garrido.pdf"]) {
  await comprobar(`${ruta} responde 200`, async () => {
    const r = await pedir(ruta);
    return r.status === 200 ? true : `HTTP ${r.status}`;
  });
}

await comprobar("Imagen Open Graph se genera", async () => {
  const r = await pedir("/opengraph-image");
  if (r.status !== 200) return `HTTP ${r.status}`;
  const tipo = r.headers.get("content-type") ?? "";
  return tipo.startsWith("image/") ? true : `content-type inesperado: ${tipo}`;
});

await comprobar("JSON-LD (schema.org) presente", async () => {
  const html = await (await pedir("/")).text();
  return html.includes('"@type":"Person"') ? true : "no se encontró el bloque Person";
});

await comprobar("Sitemap lista las rutas públicas", async () => {
  const xml = await (await pedir("/sitemap.xml")).text();
  const rutas = ["", "/en", "/cv", "/proyectos", "/laboratorio"];
  const faltan = rutas.filter((r) => !xml.includes(`${base}${r}<`));
  return faltan.length === 0 ? true : `faltan: ${faltan.join(", ")}`;
});

await comprobar("robots.txt bloquea /admin y anuncia sitemap", async () => {
  const txt = await (await pedir("/robots.txt")).text();
  if (!txt.includes("Disallow: /admin")) return "no bloquea /admin";
  return txt.includes("Sitemap:") ? true : "no referencia el sitemap";
});

await comprobar("Panel protegido (redirect a login)", async () => {
  const r = await pedir("/admin", { redirect: "manual" });
  const ubicacion = r.headers.get("location") ?? "";
  return [301, 302, 307, 308].includes(r.status) && ubicacion.includes("/admin/login")
    ? true
    : `HTTP ${r.status} → ${ubicacion || "(sin redirect)"}`;
});

await comprobar("Headers de seguridad activos", async () => {
  const r = await pedir("/");
  const faltan = ["x-content-type-options", "x-frame-options", "referrer-policy"].filter(
    (h) => !r.headers.get(h),
  );
  return faltan.length === 0 ? true : `sin headers: ${faltan.join(", ")}`;
});

console.log(
  errores === 0
    ? "\n\x1b[32mTodo en orden — deploy verificado.\x1b[0m\n"
    : `\n\x1b[31m${errores} comprobación(es) fallaron.\x1b[0m\n`,
);
process.exit(errores === 0 ? 0 : 1);
