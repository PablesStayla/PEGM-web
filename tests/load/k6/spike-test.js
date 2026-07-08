import http from 'node:http';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 500 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.95'],
  },
};

export default function () {
  const pages = ['/', '/products', '/api/products', '/api/health'];

  for (const page of pages) {
    const res = http.get(`${BASE_URL}${page}`);
    const isOk = res.status >= 200 && res.status < 400;
    check(res, { [`${page} returns 2xx-3xx`]: () => isOk });
  }
}

function check(res, conditions) {
  for (const [_name, fn] of Object.entries(conditions)) {
    if (!fn(res)) {
    }
  }
}
