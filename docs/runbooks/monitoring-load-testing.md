# Load Testing Guide

## Overview

Enterprise-level load testing strategy for PranaKaia E-Commerce using Artillery.

**Shopify-level Performance Targets:**

- **Throughput**: 1000+ requests/second
- **Latency P95**: < 500ms
- **Latency P99**: < 1s
- **Error Rate**: < 1%
- **Uptime**: 99.9% (< 43 minutes downtime/month)

---

## Test Scenarios

### 1. Load Test (Normal Traffic)

Simulates realistic production traffic patterns.

**Profile:**

- Duration: 9 minutes
- Peak: 100 requests/second
- User flows: Homepage (20%), Browse (35%), Search (25%), Checkout (15%), Health (5%)

**Run:**

```bash
TARGET_URL=https://your-domain.com pnpm load:test
```

**When to run:**

- Before major releases
- After infrastructure changes
- Weekly performance validation

---

### 2. Stress Test (Traffic Spike)

Tests system behavior under extreme load (10x normal).

**Profile:**

- Spike: 500 requests/second for 1 minute
- Tests rate limiting, queue systems, graceful degradation

**Run:**

```bash
TARGET_URL=https://staging.your-domain.com pnpm load:stress
```

**Expected behavior:**

- Rate limiting kicks in (429 responses)
- Queueing system activates
- No cascading failures
- Error rate < 5%

**When to run:**

- Before Black Friday/Cyber Monday
- After scaling infrastructure
- Capacity planning exercises

---

### 3. Endurance Test (Sustained Load)

Long-running test to detect memory leaks and performance degradation.

**Profile:**

- Duration: 1 hour
- Sustained: 50 requests/second
- Monitors resource usage trends

**Run:**

```bash
TARGET_URL=https://staging.your-domain.com pnpm load:endurance
```

**What to monitor:**

- Memory usage growth (should stabilize)
- Database connection pool (no leaks)
- Cache hit rates (should remain high)
- Error rate trends (should be flat)

**When to run:**

- Before major releases
- After significant code changes
- Monthly stability validation

---

## Pre-Test Checklist

Before running load tests:

1. **Environment**
   - [ ] Use staging or dedicated testing environment
   - [ ] Never run against production directly
   - [ ] Ensure environment matches production specs

2. **Infrastructure**
   - [ ] Database has production-level resources
   - [ ] Redis/cache is warmed up
   - [ ] CDN is configured
   - [ ] Rate limiting is enabled

3. **Monitoring**
   - [ ] Sentry error tracking active
   - [ ] Vercel Analytics enabled
   - [ ] Database monitoring dashboard open
   - [ ] Resource metrics visible (CPU, memory, I/O)

4. **Baseline**
   - [ ] Record current performance metrics
   - [ ] Document infrastructure specs
   - [ ] Note any known issues

---

## Running Tests

### Basic Load Test

```bash
# Set target URL
export TARGET_URL="https://staging.pranakaia.com"

# Run load test
pnpm load:test

# Generate HTML report
pnpm load:report
```

### Custom Configuration

Create `tests/load/custom-test.yml`:

```yaml
config:
  target: "{{ $processEnvironment.TARGET_URL }}"
  phases:
    - duration: 60
      arrivalRate: 20

scenarios:
  - name: "Custom scenario"
    flow:
      - get:
          url: "/your-endpoint"
```

Run:

```bash
artillery run tests/load/custom-test.yml
```

### With Real-Time Monitoring

```bash
# Use Artillery dashboard
artillery run tests/load/load-test.yml --record

# Or export to JSON for analysis
artillery run tests/load/load-test.yml \
  --output reports/load-$(date +%Y%m%d-%H%M%S).json
```

---

## Interpreting Results

### Key Metrics

**1. Request Rate**

```
http.request_rate: 100/sec
```

- Should match configured `arrivalRate`
- Lower = bottleneck or errors

**2. Response Time**

```
http.response_time:
  min: 42ms
  max: 1234ms
  median: 156ms
  p95: 450ms ✅
  p99: 890ms ✅
```

- **Good**: P95 < 500ms, P99 < 1s
- **Warning**: P95 > 500ms, investigate
- **Critical**: P95 > 1s, urgent optimization needed

**3. Error Rate**

```
http.codes:
  200: 9500 ✅
  429: 400 (rate limited)
  500: 100 ⚠️
```

- **Good**: < 1% errors (excluding rate limits)
- **Warning**: 1-5% errors
- **Critical**: > 5% errors

**4. Throughput**

```
http.download_rate: 2.5 MB/sec
Scenarios completed: 9800/10000 (98%) ✅
```

- Should be close to 100%
- Lower = requests timing out or failing

### Performance Baselines

| Metric      | MVP Target | Shopify Target | Current |
| ----------- | ---------- | -------------- | ------- |
| P95 Latency | < 1s       | < 500ms        | ?       |
| P99 Latency | < 2s       | < 1s           | ?       |
| Error Rate  | < 5%       | < 1%           | ?       |
| Throughput  | 100 req/s  | 1000 req/s     | ?       |

---

## Common Issues & Solutions

### Issue: High Latency (P95 > 1s)

**Probable causes:**

1. Slow database queries
2. Missing cache
3. External API timeouts

**Debug:**

```bash
# Check slow queries
cd packages/db && pnpm prisma studio

# Monitor cache hit rate
# Check Redis dashboard

# Profile API routes
# Add observability logging
```

**Fix:**

- Add database indexes
- Implement query result caching
- Add request timeouts
- Use CDN for static assets

---

### Issue: High Error Rate (> 5%)

**Probable causes:**

1. Database connection pool exhausted
2. Memory leaks
3. Race conditions
4. External service failures

**Debug:**

```bash
# Check Sentry for error patterns
sentry-cli issues list

# Monitor database connections
# SELECT * FROM pg_stat_activity;

# Check memory usage
# k6 run --vus 100 --duration 5m script.js
```

**Fix:**

- Increase connection pool size
- Add circuit breakers for external APIs
- Implement retry logic with backoff
- Scale horizontally

---

### Issue: Memory Growth

**Probable causes:**

1. Memory leaks in event listeners
2. Unclosed database connections
3. Large in-memory caches
4. Logging without rotation

**Debug:**

```bash
# Monitor memory over time
artillery run tests/load/endurance-test.yml

# Check for leaks in Node.js
node --inspect app.js
# Open chrome://inspect
# Take heap snapshots
```

**Fix:**

- Clean up event listeners
- Use connection pooling correctly
- Limit cache sizes (LRU eviction)
- Stream large responses instead of buffering

---

## CI/CD Integration

### GitHub Actions (Staging Only)

```yaml
name: Performance Test

on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Install Artillery
        run: npm install -g artillery

      - name: Run load test
        run: |
          TARGET_URL=${{ secrets.STAGING_URL }} \
          artillery run tests/load/load-test.yml \
            --output reports/load-test.json

      - name: Check thresholds
        run: |
          artillery report reports/load-test.json
          # Fail if P95 > 500ms
```

---

## Best Practices

1. **Always test staging first**
   - Never run load tests directly against production
   - Use production-like infrastructure

2. **Warm up caches**
   - Run a small test first to populate caches
   - Then run full load test

3. **Monitor infrastructure**
   - Watch CPU, memory, disk I/O
   - Monitor database connection pool
   - Check CDN cache hit rates

4. **Document baselines**
   - Record metrics after each test
   - Track performance trends over time
   - Set up automated alerts for regressions

5. **Test incrementally**
   - Start with small load (10 req/s)
   - Gradually increase to target
   - Find breaking point

6. **Clean up after tests**
   - Remove test data from database
   - Clear caches
   - Reset rate limit counters

---

## Advanced Scenarios

### Testing Specific User Flows

```yaml
# tests/load/checkout-only.yml
scenarios:
  - name: "Checkout stress"
    flow:
      - post:
          url: "/api/checkout"
          json:
            email: "test@example.com"
            # ... checkout data
```

### Simulating Real Users

```yaml
config:
  phases:
    # Black Friday traffic pattern
    - duration: 300
      arrivalRate: 50
      name: "9 AM - Store opening"
    - duration: 600
      arrivalRate: 200
      name: "10 AM - Peak traffic"
    - duration: 300
      arrivalRate: 150
      name: "11 AM - Sustained high"
```

### Testing With Authentication

```yaml
scenarios:
  - name: "Authenticated user"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "test123"
          capture:
            - json: "$.token"
              as: "authToken"

      - get:
          url: "/api/orders"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

---

## Glossary

- **RPS**: Requests per second
- **P50/P95/P99**: 50th/95th/99th percentile response time
- **VU**: Virtual Users (concurrent users)
- **Throughput**: Successfully completed requests per second
- **Latency**: Time from request sent to response received
- **Error Budget**: Allowed error rate (e.g., 0.1% = 99.9% uptime)

---

## Next Steps

1. Run baseline load test on staging
2. Document current performance metrics
3. Set up automated weekly load tests in CI
4. Configure alerts for performance regressions
5. Plan capacity for Black Friday traffic spike

---

**Questions?** Check Artillery docs: https://www.artillery.io/docs
