import http from 'node:http';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '5m', target: 20 },
    { duration: '10m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<2000'],
    http_req_failed: ['rate<0.02'],
  },
};

export default function () {
  http.get(`${BASE_URL}/api/products?limit=50&sort=price&order=desc`);
  http.get(`${BASE_URL}/api/products?search=LED&category=lights`);
  http.get(`${BASE_URL}/api/health`);
}
