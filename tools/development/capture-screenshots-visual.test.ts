import { describe, expect, it } from 'vitest';
import {
  buildDefaultRoutes,
  buildScreenshotResult,
  formatScreenshotReport,
  validateConfig,
} from './internal/screenshot-logic.js';

describe('screenshot-logic', () => {
  describe('validateConfig', () => {
    it('should accept valid config', () => {
      const result = validateConfig({
        routes: [{ name: 'home', url: 'http://localhost:3000' }],
        outputDir: '/tmp/screenshots',
        viewportWidth: 1440,
        viewportHeight: 900,
        deviceScaleFactor: 2,
        timeoutMs: 15000,
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty routes', () => {
      const result = validateConfig({
        routes: [],
        outputDir: '/tmp',
        viewportWidth: 1440,
        viewportHeight: 900,
        deviceScaleFactor: 2,
        timeoutMs: 15000,
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid URL', () => {
      const result = validateConfig({
        routes: [{ name: 'test', url: 'not-a-url' }],
        outputDir: '/tmp',
        viewportWidth: 1440,
        viewportHeight: 900,
        deviceScaleFactor: 2,
        timeoutMs: 15000,
      });

      expect(result.success).toBe(false);
    });

    it('should reject negative timeout', () => {
      const result = validateConfig({
        routes: [{ name: 'home', url: 'http://localhost:3000' }],
        outputDir: '/tmp',
        viewportWidth: 1440,
        viewportHeight: 900,
        deviceScaleFactor: 2,
        timeoutMs: 0,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('buildDefaultRoutes', () => {
    it('should generate 5 default routes', () => {
      const routes = buildDefaultRoutes('http://localhost:3000', 'http://localhost:3002');
      expect(routes).toHaveLength(5);
    });

    it('should include admin dashboard', () => {
      const routes = buildDefaultRoutes('http://localhost:3000', 'http://localhost:3002');
      const admin = routes.find((r) => r.name === 'admin-dashboard');
      expect(admin?.url).toBe('http://localhost:3002');
    });
  });

  describe('buildScreenshotResult', () => {
    it('should create success result', () => {
      const result = buildScreenshotResult('home', 'http://localhost:3000', '/tmp/home.png');
      expect(result.success).toBe(true);
      expect(result.name).toBe('home');
    });

    it('should create failure result with error', () => {
      const result = buildScreenshotResult(
        'home',
        'http://localhost:3000',
        '/tmp/home.png',
        new Error('timeout'),
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('timeout');
    });
  });

  describe('formatScreenshotReport', () => {
    it('should format mixed results', () => {
      const results = [
        buildScreenshotResult('home', 'http://localhost:3000', '/tmp/home.png'),
        buildScreenshotResult(
          'cart',
          'http://localhost:3000/cart',
          '/tmp/cart.png',
          new Error('timeout'),
        ),
      ];

      const report = formatScreenshotReport(results);
      expect(report).toContain('1 succeeded');
      expect(report).toContain('1 failed');
      expect(report).toContain('home');
      expect(report).toContain('cart');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle vendor page timeouts', () => {
      const result = buildScreenshotResult(
        'vendor-api',
        'http://vendor.example.com',
        '/tmp/vendor.png',
        new Error('Timeout 15000ms exceeded'),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Timeout');
    });

    it('should validate malformed base URL', () => {
      const result = validateConfig({
        routes: [{ name: 'test', url: 'not a url at all' }],
        outputDir: '/tmp',
        viewportWidth: 1440,
        viewportHeight: 900,
        deviceScaleFactor: 2,
        timeoutMs: 15000,
      });

      expect(result.success).toBe(false);
    });

    it('should handle very large viewport dimensions', () => {
      const result = validateConfig({
        routes: [{ name: 'test', url: 'http://localhost:3000' }],
        outputDir: '/tmp',
        viewportWidth: 5000,
        viewportHeight: 900,
        deviceScaleFactor: 2,
        timeoutMs: 15000,
      });

      expect(result.success).toBe(false);
    });
  });
});
