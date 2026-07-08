import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getAllProducts } from '@/lib/products';
import { verifyCsrfToken } from '@/lib/security/csrf';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getAllowedOrigins(requestUrl: string): string[] {
  const allowed = new Set<string>();

  try {
    allowed.add(new URL(requestUrl).origin);
  } catch {
    // Ignore malformed runtime URL.
  }

  if (env.NEXT_PUBLIC_SITE_URL) {
    try {
      allowed.add(new URL(env.NEXT_PUBLIC_SITE_URL).origin);
    } catch {
      // Ignore malformed configured URL.
    }
  }

  return [...allowed];
}

function hasAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    return true;
  }

  return getAllowedOrigins(request.url).includes(origin);
}

type ChatRequest = {
  messages?: Array<{
    role?: string;
    content?: string;
  }>;
};

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function findRelevantProducts(query: string, products: Awaited<ReturnType<typeof getAllProducts>>) {
  const tokens = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);

  if (tokens.length === 0) {
    return [];
  }

  return products
    .map((product) => {
      const searchable = normalize(
        [
          product.name,
          product.description ?? '',
          product.category ?? '',
          ...(product.tags ?? []),
        ].join(' '),
      );

      const score = tokens.reduce((acc, token) => {
        if (searchable.includes(token)) {
          return acc + 1;
        }
        return acc;
      }, 0);

      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.product);
}

function formatProductList(products: Awaited<ReturnType<typeof getAllProducts>>) {
  return products
    .map((product) => `- ${product.name} (${product.price.toLocaleString('es-CL')} CLP)`) // Keep short for chat payload
    .join('\n');
}

function buildAssistantResponse(
  message: string,
  products: Awaited<ReturnType<typeof getAllProducts>>,
) {
  const normalized = normalize(message);

  if (normalized.includes('envio')) {
    return 'Realizamos envios a todo Chile. El despacho es gratis sobre $80.000 CLP y suele tardar entre 2 y 5 dias habiles segun region.';
  }

  if (normalized.includes('devolucion') || normalized.includes('garantia')) {
    return 'Trabajamos con devolucion dentro de 30 dias y garantia de fabricante en productos aplicables. Si quieres, te indico el canal exacto para gestionar un caso.';
  }

  if (
    normalized.includes('pago') ||
    normalized.includes('tarjeta') ||
    normalized.includes('cuotas')
  ) {
    return 'Puedes pagar con tarjeta y otros medios habilitados en checkout. Tambien aplican cupones cuando estan activos. Si me dices el producto, te ayudo a estimar total.';
  }

  const relevant = findRelevantProducts(message, products);
  if (relevant.length > 0) {
    return `Encontre estos productos relacionados con tu consulta:\n${formatProductList(relevant)}\n\nSi quieres, te recomiendo uno segun presupuesto o uso.`;
  }

  const featured = products.filter((product) => product.featured).slice(0, 3);
  if (featured.length > 0) {
    return `Ahora mismo te puedo sugerir destacados del catalogo:\n${formatProductList(featured)}\n\nTambien puedes preguntar por categoria, rango de precio o marca.`;
  }

  return 'Puedo ayudarte a buscar productos, metodos de pago, envios y devoluciones. Dime que necesitas y te doy opciones concretas.';
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(req, 'chat:POST', 30, 60);
    if (!rl.allowed) {
      const res = NextResponse.json(
        { role: 'assistant', content: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.' },
        { status: 429 },
      );
      applyRateLimitHeaders(res, rl);
      return res;
    }

    if (env.NODE_ENV === 'production' && !hasAllowedOrigin(req)) {
      const res = NextResponse.json(
        { role: 'assistant', content: 'Origen de solicitud no permitido.' },
        { status: 403 },
      );
      applyRateLimitHeaders(res, rl);
      return res;
    }

    if (env.NODE_ENV === 'production') {
      const csrfToken = req.headers.get('x-csrf-token') ?? req.headers.get('X-CSRF-Token');

      if (!csrfToken || !(await verifyCsrfToken(csrfToken))) {
        const res = NextResponse.json(
          { role: 'assistant', content: 'Token CSRF inválido o ausente.' },
          { status: 403 },
        );
        applyRateLimitHeaders(res, rl);
        return res;
      }
    }

    const body = (await req.json()) as ChatRequest;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lastMessage = messages[messages.length - 1]?.content;
    const userMessage = typeof lastMessage === 'string' ? lastMessage.trim() : '';

    if (!userMessage) {
      return NextResponse.json({
        role: 'assistant',
        content: 'Cuentame que producto o tema te interesa y te ayudo enseguida.',
      });
    }

    const products = await getAllProducts();
    const content = buildAssistantResponse(userMessage, products);

    const res = NextResponse.json({ role: 'assistant', content });
    applyRateLimitHeaders(res, rl);
    return res;
  } catch {
    const res = NextResponse.json(
      {
        role: 'assistant',
        content:
          'Hubo un problema temporal al procesar tu consulta. Intenta nuevamente en unos segundos.',
      },
      { status: 500 },
    );
    return res;
  }
}
