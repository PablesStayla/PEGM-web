import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, HEAD } from './route';

// Mock Supabase client
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockLimit = vi.fn();

vi.mock('@pranakaia/infra', () => ({
  createSupabaseClient: () => ({
    from: mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        limit: mockLimit,
      }),
    }),
  }),
}));

describe('Health Check API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('GET', () => {
    it('should return healthy status when database is up', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('healthy');
      expect(body.checks.database.status).toBe('up');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('environment');
      expect(body).toHaveProperty('uptime');
    });

    it('should return unhealthy status when database is down', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.status).toBe('unhealthy');
      expect(body.checks.database.status).toBe('down');
      expect(body.checks.database.message).toBe('Connection failed');
    });

    it('should handle database exceptions', async () => {
      mockLimit.mockRejectedValue(new Error('Network error'));

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.checks.database.status).toBe('down');
      expect(body.checks.database.message).toBe('Network error');
    });

    it('should include response time for database check', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const response = await GET();
      const body = await response.json();

      expect(body.checks.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(body.checks.database.responseTime).toBeDefined();
    });

    it('should return cache control headers', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const response = await GET();

      expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should track uptime', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      // Advance time by 1000ms
      vi.advanceTimersByTime(1000);

      const response = await GET();
      const body = await response.json();

      expect(body.uptime).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('HEAD', () => {
    it('should return 200 status', async () => {
      const response = await HEAD();

      expect(response.status).toBe(200);
    });

    it('should return empty body', async () => {
      const response = await HEAD();
      const body = await response.text();

      expect(body).toBe('');
    });
  });
});
