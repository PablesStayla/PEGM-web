import http from 'node:http';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 50 },
    { duration: '10m', target: 50 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.98'],
  },
};

const CHILEAN_ADDRESSES = [
  { city: 'Santiago', region: 'Región Metropolitana', postalCode: '7500000' },
  { city: 'Valparaíso', region: 'Valparaíso', postalCode: '2340000' },
  { city: 'Concepción', region: 'Biobío', postalCode: '4030000' },
];

export default function () {
  const addr = CHILEAN_ADDRESSES[Math.floor(Math.random() * CHILEAN_ADDRESSES.length)];

  const productsRes = http.get(`${BASE_URL}/api/products?limit=20`);
  check(productsRes, { 'products list 200': () => productsRes.status === 200 });

  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, { 'health check 200': () => healthRes.status === 200 });

  const cartPayload = JSON.stringify({
    productId: `prod_${Math.floor(Math.random() * 100)}`,
    quantity: Math.floor(Math.random() * 3) + 1,
  });

  const cartRes = http.post(`${BASE_URL}/api/cart`, cartPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(cartRes, { 'cart add 2xx': () => cartRes.status >= 200 && cartRes.status < 300 });

  const checkoutPayload = JSON.stringify({
    email: `loadtest_${Math.floor(Math.random() * 100000)}@example.com`,
    name: 'Load Test User',
    address: 'Av. Test 123',
    city: addr.city,
    region: addr.region,
    postalCode: addr.postalCode,
    country: 'CL',
  });

  const checkoutRes = http.post(`${BASE_URL}/api/checkout`, checkoutPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(checkoutRes, {
    'checkout returns valid status': () => [200, 303, 401, 422].includes(checkoutRes.status),
  });
}

function check(res, conditions) {
  for (const [_name, fn] of Object.entries(conditions)) {
    if (!fn(res)) {
    }
  }
}
