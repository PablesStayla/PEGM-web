/**
 * Rate Limiting Configuration
 *
 * Rate limiting implementation for API endpoints
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.',
};

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  isAllowed(ip: string, config: RateLimitConfig = defaultConfig): boolean {
    const now = Date.now();
    const key = ip;
    const requestData = this.requests.get(key);

    if (!requestData || now > requestData.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (requestData.count >= config.maxRequests) {
      return false;
    }

    requestData.count++;
    return true;
  }

  getRemainingRequests(ip: string, config: RateLimitConfig = defaultConfig): number {
    const requestData = this.requests.get(ip);
    if (!requestData || Date.now() > requestData.resetTime) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - requestData.count);
  }

  getResetTime(ip: string): number {
    const requestData = this.requests.get(ip);
    return requestData?.resetTime || Date.now();
  }
}

export const rateLimiter = new RateLimiter();
export default rateLimiter;
