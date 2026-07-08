import { describe, expect, it } from 'vitest';
import { CommonErrors, problemDetails, problemResponse } from './errors';

describe('problemDetails()', () => {
  it('uses pranakaia.cl domain in type URL', () => {
    const pd = problemDetails(404, 'Not Found');
    expect(pd.type).toContain('pranakaia.cl');
  });

  it('includes status code in type URL when no custom type given', () => {
    const pd = problemDetails(422, 'Unprocessable');
    expect(pd.type).toContain('422');
  });

  it('uses provided type when given', () => {
    const pd = problemDetails(
      400,
      'Bad Request',
      undefined,
      'https://example.com/errors/bad-request',
    );
    expect(pd.type).toBe('https://example.com/errors/bad-request');
  });

  it('includes detail when provided', () => {
    const pd = problemDetails(400, 'Bad Request', 'The sku field is required.');
    expect(pd.detail).toBe('The sku field is required.');
  });

  it('omits detail when not provided', () => {
    const pd = problemDetails(400, 'Bad Request');
    expect('detail' in pd).toBe(false);
  });

  it('spreads extensions into the response', () => {
    const pd = problemDetails(422, 'Unprocessable', undefined, undefined, {
      fields: { name: ['Required'] },
    });
    expect(pd['fields']).toEqual({ name: ['Required'] });
  });
});

describe('problemResponse()', () => {
  it('returns the correct HTTP status code', async () => {
    const res = problemResponse(404, 'Not Found');
    expect(res.status).toBe(404);
  });

  it('sets Content-Type to application/problem+json', () => {
    const res = problemResponse(422, 'Unprocessable');
    expect(res.headers.get('Content-Type')).toBe('application/problem+json');
  });

  it('body is valid JSON with title and status fields', async () => {
    const res = problemResponse(404, 'Not Found', 'Product not found.');
    const body = await res.json();
    expect(body.title).toBe('Not Found');
    expect(body.status).toBe(404);
    expect(body.detail).toBe('Product not found.');
  });
});

describe('CommonErrors', () => {
  it('BadRequest returns 400', async () => {
    expect(CommonErrors.BadRequest().status).toBe(400);
  });

  it('Unauthorized returns 401', () => {
    expect(CommonErrors.Unauthorized().status).toBe(401);
  });

  it('Forbidden returns 403', () => {
    expect(CommonErrors.Forbidden().status).toBe(403);
  });

  it('NotFound returns 404', () => {
    expect(CommonErrors.NotFound().status).toBe(404);
  });

  it('Conflict returns 409', () => {
    expect(CommonErrors.Conflict().status).toBe(409);
  });

  it('UnprocessableEntity returns 422 with extensions', async () => {
    const res = CommonErrors.UnprocessableEntity('Invalid', { fields: { sku: ['Required'] } });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body['fields']).toEqual({ sku: ['Required'] });
  });

  it('TooManyRequests returns 429 with retryAfter', async () => {
    const res = CommonErrors.TooManyRequests(undefined, 30);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body['retryAfter']).toBe(30);
  });

  it('InternalServerError returns 500', () => {
    expect(CommonErrors.InternalServerError().status).toBe(500);
  });

  it('ServiceUnavailable returns 503', () => {
    expect(CommonErrors.ServiceUnavailable().status).toBe(503);
  });
});
