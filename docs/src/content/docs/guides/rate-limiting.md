---
title: Rate Limiting
description: Learn how to handle rate limits effectively when using the Synthesia SDK.
sidebar:
  order: 5
---

Learn how to handle rate limits effectively when using the Synthesia SDK to ensure reliable and scalable video generation workflows.

> 📖 **Official API Documentation**: [Synthesia API Rate Limits](https://docs.synthesia.io/reference/synthesia-api-quickstart#rate-limits)

## Understanding Rate Limits

Synthesia implements rate limiting to ensure fair usage and maintain service quality for all users. Rate limits vary based on your subscription plan:

| Plan | Requests per Minute | Concurrent Videos | Monthly Credits |
|------|-------------------|------------------|-----------------|
| Creator | 60 | 3 | Plan-dependent |
| Enterprise Tier 1 | 120 | 5 | Plan-dependent |
| Enterprise Tier 2 | 180 | 10 | Plan-dependent |
| Enterprise Tier 3 | 300 | 20 | Plan-dependent |

## Rate Limit Headers

The API returns rate limit information in response headers:

```typescript
// Example response headers
{
  'x-ratelimit-limit': '60',           // Requests per minute
  'x-ratelimit-remaining': '45',       // Remaining requests in window
  'x-ratelimit-reset': '1640995200'    // Unix timestamp when limit resets
}
```

## Basic Rate Limit Handling

### Checking Rate Limit Status

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});

async function checkRateLimitStatus() {
  // Make a lightweight request to check status
  const response = await synthesia.templates.listTemplates({ source: 'synthesia' });
  
  if (response.error?.statusCode === 429) {
    console.log('⚠️ Rate limit exceeded');
    console.log('Retry after:', response.error.details?.retryAfter || 60, 'seconds');
    return false;
  }
  
  // Check remaining rate limit (if available in headers)
  const rateLimitInfo = response.error?.details?.rateLimit;
  if (rateLimitInfo) {
    console.log(`Rate limit: ${rateLimitInfo.remaining}/${rateLimitInfo.limit}`);
    console.log(`Resets at: ${new Date(rateLimitInfo.resetAt * 1000)}`);
  }
  
  return true;
}
```

### Simple Rate Limit Handling

```typescript
async function createVideoWithRateLimit() {
  const response = await synthesia.videos.createVideo({
    input: [{
      scriptText: 'Testing rate limit handling',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    }],
    title: 'Rate Limited Video',
    visibility: 'private',
    aspectRatio: '16:9',
    test: true
  });
  
  if (response.error?.statusCode === 429) {
    console.log('🚦 Rate limit hit, waiting...');
    
    // Wait before retrying (default: 60 seconds)
    const retryAfter = response.error.details?.retryAfter || 60;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    
    console.log('🔄 Retrying after rate limit...');
    return createVideoWithRateLimit(); // Recursive retry
  }
  
  return response.data;
}
```

## Advanced Rate Limiting Strategies

### Token Bucket Implementation

```typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private capacity: number,     // Maximum tokens (requests per minute)
    private refillRate: number    // Tokens added per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  
  private refill() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = Math.floor(timePassed * this.refillRate);
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
  
  async consume(tokens = 1): Promise<boolean> {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    // Calculate wait time for next token
    const tokensNeeded = tokens - this.tokens;
    const waitTime = (tokensNeeded / this.refillRate) * 1000;
    
    console.log(`⏳ Rate limited, waiting ${Math.ceil(waitTime / 1000)}s for tokens...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    return this.consume(tokens); // Retry after waiting
  }
  
  getStatus() {
    this.refill();
    return {
      tokens: this.tokens,
      capacity: this.capacity,
      percentage: (this.tokens / this.capacity) * 100
    };
  }
}

// Usage
const rateLimiter = new TokenBucket(60, 1); // 60 requests per minute

async function createVideoWithTokenBucket() {
  // Wait for token availability
  await rateLimiter.consume();
  
  const response = await synthesia.videos.createVideo({
    input: [{
      scriptText: 'Using token bucket rate limiting',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    }],
    title: 'Token Bucket Video',
    visibility: 'private',
    aspectRatio: '16:9',
    test: true
  });
  
  return response.data;
}
```

### Queue-Based Rate Limiting

```typescript
import { Queue } from 'bull';

class RateLimitedQueue {
  private queue: Queue;
  private processing = false;
  
  constructor(private requestsPerMinute: number) {
    this.queue = new Queue('synthesia requests', {
      redis: { port: 6379, host: '127.0.0.1' }
    });
    
    // Process queue at rate limit pace
    const delayBetweenJobs = (60 * 1000) / requestsPerMinute;
    
    this.queue.process(1, async (job) => {
      const { operation, params } = job.data;
      
      try {
        const result = await this.executeOperation(operation, params);
        return result;
      } catch (error) {
        if (error.statusCode === 429) {
          // Re-queue with delay if rate limited
          throw new Error('Rate limited - will retry');
        }
        throw error;
      }
    });
    
    // Set processing delay
    this.queue.on('completed', () => {
      setTimeout(() => {
        // Process next job after delay
      }, delayBetweenJobs);
    });
  }
  
  async addRequest(operation: string, params: any): Promise<any> {
    const job = await this.queue.add('api-request', {
      operation,
      params
    }, {
      attempts: 3,
      backoff: 'exponential',
      delay: 0
    });
    
    return job.finished();
  }
  
  private async executeOperation(operation: string, params: any) {
    switch (operation) {
      case 'createVideo':
        return synthesia.videos.createVideo(params);
      case 'listVideos':
        return synthesia.videos.listVideos(params);
      case 'getVideo':
        return synthesia.videos.getVideo(params.videoId);
      // Add more operations as needed
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
  
  getQueueStats() {
    return {
      waiting: this.queue.waiting(),
      active: this.queue.active(),
      completed: this.queue.completed(),
      failed: this.queue.failed()
    };
  }
}

// Usage
const rateLimitedQueue = new RateLimitedQueue(60); // 60 requests per minute

async function createVideoQueued(params: any) {
  console.log('🔄 Adding video creation to queue...');
  
  const result = await rateLimitedQueue.addRequest('createVideo', params);
  
  if (result.data) {
    console.log('✅ Video created via queue:', result.data.id);
    return result.data;
  }
  
  return null;
}
```

### Batch Processing with Rate Limits

```typescript
async function processBatchWithRateLimit<T>(
  items: T[],
  processor: (item: T) => Promise<any>,
  requestsPerMinute = 60
) {
  const delayBetweenRequests = (60 * 1000) / requestsPerMinute;
  const results: any[] = [];
  
  console.log(`📦 Processing ${items.length} items at ${requestsPerMinute} requests/minute`);
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const startTime = Date.now();
    
    try {
      console.log(`Processing item ${i + 1}/${items.length}...`);
      const result = await processor(item);
      results.push({ success: true, result, item });
      
    } catch (error) {
      console.error(`Failed to process item ${i + 1}:`, error.message);
      results.push({ success: false, error: error.message, item });
      
      // Handle rate limit specially
      if (error.statusCode === 429) {
        const retryAfter = error.details?.retryAfter || 60;
        console.log(`⏱️ Rate limited, waiting ${retryAfter}s...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue; // Don't apply normal delay after rate limit wait
      }
    }
    
    // Apply rate limiting delay
    if (i < items.length - 1) { // Don't wait after last item
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, delayBetweenRequests - elapsed);
      
      if (remainingDelay > 0) {
        console.log(`⏳ Waiting ${remainingDelay}ms for rate limit...`);
        await new Promise(resolve => setTimeout(resolve, remainingDelay));
      }
    }
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Batch complete: ${successful}/${items.length} successful`);
  
  return results;
}

// Usage: Create multiple videos with rate limiting
const videoConfigs = [
  { title: 'Video 1', scriptText: 'First video script' },
  { title: 'Video 2', scriptText: 'Second video script' },
  { title: 'Video 3', scriptText: 'Third video script' },
  // ... more videos
];

const results = await processBatchWithRateLimit(
  videoConfigs,
  async (config) => {
    const response = await synthesia.videos.createVideo({
      input: [{
        scriptText: config.scriptText,
        avatar: 'anna_costume1_cameraA',
        background: 'office'
      }],
      title: config.title,
      visibility: 'private',
      aspectRatio: '16:9',
      test: true
    });
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data;
  },
  30 // 30 requests per minute for safer processing
);
```

## Monitoring Rate Limits

### Rate Limit Monitor

```typescript
class RateLimitMonitor {
  private requestLog: { timestamp: number; success: boolean }[] = [];
  private rateLimitHits = 0;
  
  logRequest(success: boolean, wasRateLimited = false) {
    this.requestLog.push({
      timestamp: Date.now(),
      success
    });
    
    if (wasRateLimited) {
      this.rateLimitHits++;
    }
    
    // Keep only last hour of data
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.requestLog = this.requestLog.filter(req => req.timestamp > oneHourAgo);
  }
  
  getStats() {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const lastMinute = this.requestLog.filter(req => req.timestamp > oneMinuteAgo);
    const lastHour = this.requestLog.filter(req => req.timestamp > oneHourAgo);
    
    return {
      requestsLastMinute: lastMinute.length,
      requestsLastHour: lastHour.length,
      successRateLastHour: lastHour.length > 0 
        ? (lastHour.filter(req => req.success).length / lastHour.length) * 100 
        : 100,
      totalRateLimitHits: this.rateLimitHits,
      averageRequestsPerMinute: lastHour.length / 60
    };
  }
  
  isNearRateLimit(threshold = 0.8) {
    const stats = this.getStats();
    // Assuming 60 requests per minute limit
    return stats.requestsLastMinute > (60 * threshold);
  }
  
  shouldBackoff() {
    return this.isNearRateLimit(0.9); // Back off at 90% of rate limit
  }
}

// Global monitor
const rateLimitMonitor = new RateLimitMonitor();

// Wrapper for API calls with monitoring
async function monitoredApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    // Check if we should back off
    if (rateLimitMonitor.shouldBackoff()) {
      console.log('🚦 Backing off due to high request rate...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    const result = await apiCall();
    rateLimitMonitor.logRequest(true, false);
    return result;
    
  } catch (error) {
    const wasRateLimited = error.statusCode === 429;
    rateLimitMonitor.logRequest(false, wasRateLimited);
    
    if (wasRateLimited) {
      console.log('📊 Rate Limit Stats:', rateLimitMonitor.getStats());
    }
    
    throw error;
  }
}

// Usage
const video = await monitoredApiCall(() =>
  synthesia.videos.createVideo({
    input: [{
      scriptText: 'This request is being monitored',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    }],
    title: 'Monitored Video',
    visibility: 'private',
    aspectRatio: '16:9',
    test: true
  })
);
```

### Rate Limit Dashboard

```typescript
class RateLimitDashboard {
  constructor(private monitor: RateLimitMonitor) {}
  
  displayStats() {
    const stats = this.monitor.getStats();
    
    console.log('\n📊 Rate Limit Dashboard');
    console.log('========================');
    console.log(`Requests (last minute): ${stats.requestsLastMinute}/60`);
    console.log(`Requests (last hour): ${stats.requestsLastHour}`);
    console.log(`Success rate: ${stats.successRateLastHour.toFixed(1)}%`);
    console.log(`Rate limit hits: ${stats.totalRateLimitHits}`);
    console.log(`Avg requests/min: ${stats.averageRequestsPerMinute.toFixed(1)}`);
    
    // Visual rate limit meter
    const usage = (stats.requestsLastMinute / 60) * 100;
    const meter = '█'.repeat(Math.floor(usage / 5)) + '░'.repeat(20 - Math.floor(usage / 5));
    console.log(`Rate limit usage: [${meter}] ${usage.toFixed(1)}%`);
    
    // Warnings
    if (stats.requestsLastMinute > 50) {
      console.log('⚠️ WARNING: Approaching rate limit');
    }
    
    if (stats.totalRateLimitHits > 0) {
      console.log(`🚨 ${stats.totalRateLimitHits} rate limit hits detected`);
    }
    
    console.log('========================\n');
  }
  
  startMonitoring(intervalMs = 60000) {
    console.log('🔍 Starting rate limit monitoring...');
    
    setInterval(() => {
      this.displayStats();
    }, intervalMs);
  }
}

// Usage
const dashboard = new RateLimitDashboard(rateLimitMonitor);
dashboard.startMonitoring(30000); // Update every 30 seconds
```

## Adaptive Rate Limiting

### Dynamic Rate Adjustment

```typescript
class AdaptiveRateLimiter {
  private currentRate: number;
  private consecutiveSuccesses = 0;
  private consecutiveFailures = 0;
  
  constructor(
    private initialRate: number,
    private minRate: number = 10,
    private maxRate: number = 60
  ) {
    this.currentRate = initialRate;
  }
  
  async executeWithAdaptiveRate<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
      
    } catch (error) {
      if (error.statusCode === 429) {
        this.onRateLimit();
        
        // Wait and retry
        const retryAfter = error.details?.retryAfter || 60;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        
        return this.executeWithAdaptiveRate(operation);
      }
      
      this.onError();
      throw error;
      
    } finally {
      // Apply current rate limiting
      const elapsed = Date.now() - startTime;
      const minInterval = (60 * 1000) / this.currentRate;
      const remainingWait = Math.max(0, minInterval - elapsed);
      
      if (remainingWait > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingWait));
      }
    }
  }
  
  private onSuccess() {
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;
    
    // Gradually increase rate after sustained success
    if (this.consecutiveSuccesses >= 10 && this.currentRate < this.maxRate) {
      this.currentRate = Math.min(this.maxRate, this.currentRate + 5);
      console.log(`📈 Increased rate to ${this.currentRate} requests/minute`);
      this.consecutiveSuccesses = 0;
    }
  }
  
  private onRateLimit() {
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    
    // Immediately reduce rate on rate limit
    this.currentRate = Math.max(this.minRate, this.currentRate * 0.7);
    console.log(`📉 Reduced rate to ${this.currentRate} requests/minute due to rate limit`);
  }
  
  private onError() {
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    
    // Slightly reduce rate on errors
    if (this.consecutiveFailures >= 5) {
      this.currentRate = Math.max(this.minRate, this.currentRate - 2);
      console.log(`📉 Reduced rate to ${this.currentRate} requests/minute due to errors`);
      this.consecutiveFailures = 0;
    }
  }
  
  getCurrentRate() {
    return this.currentRate;
  }
}

// Usage
const adaptiveLimiter = new AdaptiveRateLimiter(30, 10, 60);

async function createVideoAdaptive(params: any) {
  return adaptiveLimiter.executeWithAdaptiveRate(() =>
    synthesia.videos.createVideo(params)
  );
}
```

## Best Practices

### 1. Respect Rate Limits Proactively

```typescript
// Track your request rate before hitting limits
const requestTracker = {
  requests: [] as number[],
  
  logRequest() {
    const now = Date.now();
    this.requests.push(now);
    
    // Keep only last minute
    const oneMinuteAgo = now - 60000;
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
  },
  
  canMakeRequest(limit = 60) {
    return this.requests.length < limit;
  },
  
  getRequestsInLastMinute() {
    return this.requests.length;
  }
};

async function respectfulApiCall() {
  if (!requestTracker.canMakeRequest()) {
    console.log('⏳ Waiting to respect rate limit...');
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
  
  requestTracker.logRequest();
  
  // Make API call
  return synthesia.videos.createVideo({
    input: [{
      scriptText: 'Respecting rate limits',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    }],
    title: 'Respectful Video',
    visibility: 'private',
    aspectRatio: '16:9',
    test: true
  });
}
```

### 2. Use Appropriate Retry Strategies

```typescript
async function retryWithBackoffAndJitter(
  operation: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
      
    } catch (error) {
      if (error.statusCode === 429) {
        // Use server-provided retry-after if available
        const retryAfter = error.details?.retryAfter || 60;
        const jitter = Math.random() * 1000; // Add randomness
        const delay = (retryAfter * 1000) + jitter;
        
        console.log(`Rate limited, waiting ${Math.ceil(delay / 1000)}s (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } else if (attempt === maxRetries) {
        throw error;
      } else {
        // Exponential backoff for other errors
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
```

### 3. Implement Circuit Breaker for Rate Limits

```typescript
class RateLimitCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold = 3,
    private recoveryTimeout = 300000 // 5 minutes
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Rate limit circuit breaker: Trying half-open state');
      } else {
        throw new Error('Circuit breaker OPEN due to rate limits');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
      
    } catch (error) {
      if (error.statusCode === 429) {
        this.onRateLimitFailure();
      }
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onRateLimitFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('🚨 Rate limit circuit breaker OPEN - cooling down');
    }
  }
}
```

## Production Deployment Considerations

### Environment-Specific Rate Limits

```typescript
const getRateLimitConfig = (environment: string) => {
  const configs = {
    development: {
      requestsPerMinute: 10, // Conservative for testing
      batchSize: 5,
      retryAttempts: 2
    },
    staging: {
      requestsPerMinute: 30,
      batchSize: 10,
      retryAttempts: 3
    },
    production: {
      requestsPerMinute: 50, // Leave headroom
      batchSize: 20,
      retryAttempts: 5
    }
  };
  
  return configs[environment] || configs.development;
};

const config = getRateLimitConfig(process.env.NODE_ENV);
const rateLimiter = new TokenBucket(
  config.requestsPerMinute,
  config.requestsPerMinute / 60
);
```

### Load Balancing Rate Limits

```typescript
// For multiple servers sharing rate limits
class DistributedRateLimiter {
  constructor(
    private redis: any,
    private keyPrefix: string,
    private limit: number,
    private windowMs: number
  ) {}
  
  async checkRateLimit(identifier: string): Promise<boolean> {
    const key = `${this.keyPrefix}:${identifier}`;
    const window = Math.floor(Date.now() / this.windowMs);
    const windowKey = `${key}:${window}`;
    
    const current = await this.redis.incr(windowKey);
    await this.redis.expire(windowKey, Math.ceil(this.windowMs / 1000));
    
    return current <= this.limit;
  }
}
```

## Troubleshooting Rate Limits

### Common Issues and Solutions

1. **Sudden Rate Limit Errors**
   - Check for code changes that increased request frequency
   - Verify batch processing isn't running concurrently
   - Monitor for retry loops

2. **Inconsistent Rate Limiting**
   - Rate limits may reset at different times
   - Multiple processes may share the same limit
   - Network delays can affect timing

3. **Rate Limits Lower Than Expected**
   - Check your current plan limits
   - Verify account status
   - Contact support if limits seem incorrect

### Debugging Rate Limit Issues

```typescript
async function debugRateLimit() {
  console.log('🔍 Debugging rate limit status...');
  
  // Make a test request to check headers
  try {
    const response = await synthesia.templates.listTemplates();
    
    if (response.error?.statusCode === 429) {
      console.log('❌ Currently rate limited');
      console.log('Retry after:', response.error.details?.retryAfter);
    } else {
      console.log('✅ Not currently rate limited');
    }
    
  } catch (error) {
    console.error('Debug request failed:', error);
  }
  
  // Check current monitor stats
  const stats = rateLimitMonitor.getStats();
  console.log('📊 Current stats:', stats);
}
```

## Next Steps

- [Implement webhooks to reduce API polling](/synthesia-sdk/guides/webhooks/)
- [Learn about error handling strategies](/synthesia-sdk/guides/error-handling/)
