---
title: Error Handling
description: Learn how to implement robust error handling in your Synthesia SDK applications.
sidebar:
  order: 4
---

Learn how to implement robust error handling in your Synthesia SDK applications to create reliable and user-friendly video generation workflows.

> 📖 **Official API Documentation**: [Synthesia API Errors](https://docs.synthesia.io/reference/synthesia-api-quickstart#error-handling)

## Understanding SDK Error Structure

The Synthesia SDK returns errors in a consistent format:

```typescript
interface SynthesiaError {
  message: string;     // Human-readable error description
  code?: string;       // Error code for programmatic handling
  statusCode: number;  // HTTP status code
  details?: any;       // Additional error context
}

interface APIResponse<T> {
  data?: T;           // Response data (present on success)
  error?: SynthesiaError; // Error information (present on failure)
}
```

## Basic Error Handling

### Simple Error Checking

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});

async function createVideoSafely() {
  const response = await synthesia.videos.createVideo({
    title: 'My Video',
    scriptText: 'Hello, world!',
    avatar: 'anna_costume1_cameraA',
    background: 'office',
    test: true
  });

  // Always check for errors first
  if (response.error) {
    console.error('❌ Video creation failed:', response.error.message);
    console.error('Status Code:', response.error.statusCode);
    return null;
  }

  // Safe to use data
  console.log('✅ Video created:', response.data.id);
  return response.data;
}
```

### Try-Catch Pattern

```typescript
async function createVideoWithTryCatch() {
  try {
    const response = await synthesia.videos.createVideo({
      title: 'My Video',
      scriptText: 'Hello, world!',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    });

    if (response.error) {
      throw new Error(`API Error: ${response.error.message} (${response.error.statusCode})`);
    }

    return response.data.id;

  } catch (error) {
    console.error('Video creation failed:', error.message);
    
    // Handle different error types
    if (error.message.includes('401')) {
      console.error('Check your API key');
    } else if (error.message.includes('429')) {
      console.error('Rate limit exceeded - try again later');
    }
    
    throw error; // Re-throw if needed
  }
}
```

## Common Error Types and Handling

### Authentication Errors (401)

```typescript
async function handleAuthErrors() {
  const response = await synthesia.videos.listVideos();
  
  if (response.error?.statusCode === 401) {
    console.error('🔑 Authentication failed');
    console.error('Possible causes:');
    console.error('- Invalid API key');
    console.error('- Expired API key');
    console.error('- API key not provided');
    
    // Attempt to refresh or prompt for new key
    await handleAuthFailure();
    return null;
  }
  
  return response.data;
}

async function handleAuthFailure() {
  // Log user out, redirect to login, etc.
  console.log('Please check your API key in account settings');
}
```

### Validation Errors (400)

```typescript
async function handleValidationErrors() {
  const response = await synthesia.videos.createVideo({
    title: '', // Empty title will cause validation error
    scriptText: 'Hello world',
    avatar: 'invalid_avatar', // Invalid avatar ID
    background: 'office'
  });
  
  if (response.error?.statusCode === 400) {
    console.error('📋 Validation failed');
    console.error('Error details:', response.error.details);
    
    // Handle specific validation issues
    if (response.error.message.includes('title')) {
      console.error('- Title is required and cannot be empty');
    }
    
    if (response.error.message.includes('avatar')) {
      console.error('- Invalid avatar ID provided');
      console.log('💡 Tip: Check available avatars in the documentation');
    }
    
    return null;
  }
  
  return response.data;
}
```

### Rate Limiting (429)

```typescript
async function handleRateLimiting() {
  const response = await synthesia.videos.createVideo({
    title: 'My Video',
    scriptText: 'Hello world',
    avatar: 'anna_costume1_cameraA',
    background: 'office'
  });
  
  if (response.error?.statusCode === 429) {
    console.warn('⏱️ Rate limit exceeded');
    
    // Get rate limit info from headers (if available)
    const retryAfter = response.error.details?.retryAfter || 60;
    
    console.log(`Waiting ${retryAfter} seconds before retry...`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    
    // Retry the request
    return handleRateLimiting();
  }
  
  return response.data;
}
```

### Insufficient Credits (402/403)

```typescript
async function handleInsufficientCredits() {
  const response = await synthesia.videos.createVideo({
    title: 'My Video',
    scriptText: 'Hello world',
    avatar: 'anna_costume1_cameraA',
    background: 'office',
    test: false // Production video requires credits
  });
  
  if (response.error?.statusCode === 402 || response.error?.statusCode === 403) {
    console.error('💳 Insufficient credits or permissions');
    console.error('Possible solutions:');
    console.error('- Upgrade your Synthesia plan');
    console.error('- Purchase additional credits');
    console.error('- Use test mode for development');
    
    // Offer fallback to test mode
    console.log('🔄 Falling back to test mode...');
    
    const testResponse = await synthesia.videos.createVideo({
      title: 'My Video (Test)',
      scriptText: 'Hello world',
      avatar: 'anna_costume1_cameraA',
      background: 'office',
      test: true // Free test video
    });
    
    return testResponse.data;
  }
  
  return response.data;
}
```

### Server Errors (500+)

```typescript
async function handleServerErrors() {
  const response = await synthesia.videos.createVideo({
    title: 'My Video',
    scriptText: 'Hello world',
    avatar: 'anna_costume1_cameraA',
    background: 'office'
  });
  
  if (response.error?.statusCode >= 500) {
    console.error('🔧 Server error occurred');
    console.error('This is typically a temporary issue');
    
    // Implement exponential backoff retry
    return retryWithBackoff(() => 
      synthesia.videos.createVideo({
        title: 'My Video',
        scriptText: 'Hello world',
        avatar: 'anna_costume1_cameraA',
        background: 'office'
      })
    );
  }
  
  return response.data;
}
```

## Advanced Error Handling Patterns

### Comprehensive Error Handler

```typescript
class SynthesiaErrorHandler {
  static async handleResponse<T>(response: APIResponse<T>): Promise<T> {
    if (!response.error) {
      return response.data!;
    }
    
    const error = response.error;
    
    switch (error.statusCode) {
      case 400:
        throw new ValidationError(error.message, error.details);
      case 401:
        throw new AuthenticationError(error.message);
      case 403:
        throw new PermissionError(error.message);
      case 404:
        throw new NotFoundError(error.message);
      case 429:
        throw new RateLimitError(error.message, error.details);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(error.message, error.statusCode);
      default:
        throw new SynthesiaAPIError(error.message, error.statusCode);
    }
  }
}

// Custom error classes
class SynthesiaAPIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'SynthesiaAPIError';
  }
}

class ValidationError extends SynthesiaAPIError {
  constructor(message: string, public details?: any) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends SynthesiaAPIError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class RateLimitError extends SynthesiaAPIError {
  constructor(message: string, public retryAfter?: number) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

// Usage
async function createVideoWithHandler() {
  try {
    const response = await synthesia.videos.createVideo({
      title: 'My Video',
      scriptText: 'Hello world',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    });
    
    const video = await SynthesiaErrorHandler.handleResponse(response);
    console.log('Video created:', video.id);
    return video;
    
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation failed:', error.details);
    } else if (error instanceof RateLimitError) {
      console.error('Rate limited, retry after:', error.retryAfter);
    } else if (error instanceof AuthenticationError) {
      console.error('Authentication failed - check API key');
    }
    
    throw error;
  }
}
```

### Retry Logic with Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<APIResponse<T>>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await operation();
      
      if (!response.error) {
        return response.data!;
      }
      
      // Don't retry client errors (4xx)
      if (response.error.statusCode >= 400 && response.error.statusCode < 500) {
        throw new Error(response.error.message);
      }
      
      // Only retry server errors (5xx)
      if (attempt === maxRetries) {
        throw new Error(`Max retries exceeded: ${response.error.message}`);
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Network error, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Should not reach here');
}

// Usage
const video = await retryWithBackoff(() => 
  synthesia.videos.createVideo({
    title: 'My Video',
    scriptText: 'Hello world',
    avatar: 'anna_costume1_cameraA',
    background: 'office'
  })
);
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000
  ) {}
  
  async execute<T>(operation: () => Promise<APIResponse<T>>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const response = await operation();
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Success - reset circuit breaker
      this.onSuccess();
      return response.data!;
      
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage
const circuitBreaker = new CircuitBreaker();

async function createVideoWithCircuitBreaker() {
  try {
    return await circuitBreaker.execute(() =>
      synthesia.videos.createVideo({
        title: 'My Video',
        scriptText: 'Hello world',
        avatar: 'anna_costume1_cameraA',
        background: 'office'
      })
    );
  } catch (error) {
    console.error('Circuit breaker prevented request or request failed:', error.message);
    return null;
  }
}
```

## User-Friendly Error Messages

### Error Message Mapping

```typescript
const ERROR_MESSAGES = {
  400: {
    title: 'Invalid Request',
    message: 'Please check your video parameters and try again.',
    actions: ['Verify avatar and background IDs', 'Check script length', 'Ensure title is provided']
  },
  401: {
    title: 'Authentication Required',
    message: 'Your API key is invalid or missing.',
    actions: ['Check your API key', 'Verify account status', 'Contact support if needed']
  },
  402: {
    title: 'Payment Required',
    message: 'Insufficient credits to create this video.',
    actions: ['Upgrade your plan', 'Purchase additional credits', 'Use test mode for development']
  },
  403: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action.',
    actions: ['Check your plan limits', 'Verify account permissions', 'Contact your administrator']
  },
  429: {
    title: 'Rate Limited',
    message: 'Too many requests. Please slow down.',
    actions: ['Wait before retrying', 'Implement request throttling', 'Consider upgrading your plan']
  },
  500: {
    title: 'Server Error',
    message: 'Something went wrong on our end.',
    actions: ['Try again in a few minutes', 'Contact support if persistent', 'Check status page']
  }
};

function getUserFriendlyError(statusCode: number, originalMessage: string) {
  const errorInfo = ERROR_MESSAGES[statusCode] || {
    title: 'Unknown Error',
    message: originalMessage,
    actions: ['Contact support with error details']
  };
  
  return {
    ...errorInfo,
    originalMessage,
    statusCode,
    timestamp: new Date().toISOString()
  };
}

// Usage in UI
async function createVideoForUser() {
  try {
    const response = await synthesia.videos.createVideo({
      title: 'User Video',
      scriptText: 'Hello from user interface',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    });
    
    if (response.error) {
      const userError = getUserFriendlyError(
        response.error.statusCode,
        response.error.message
      );
      
      // Display user-friendly error in UI
      showErrorToUser(userError);
      return null;
    }
    
    return response.data;
    
  } catch (error) {
    const userError = getUserFriendlyError(500, error.message);
    showErrorToUser(userError);
    return null;
  }
}

function showErrorToUser(error: any) {
  console.log(`❌ ${error.title}`);
  console.log(error.message);
  console.log('\nSuggested actions:');
  error.actions.forEach((action: string, index: number) => {
    console.log(`${index + 1}. ${action}`);
  });
}
```

### Progress Tracking with Error Recovery

```typescript
class VideoCreationProcess {
  private status: 'idle' | 'creating' | 'processing' | 'complete' | 'error' = 'idle';
  private error: any = null;
  private videoId: string | null = null;
  
  async createVideo(params: any, onProgress?: (status: string) => void) {
    try {
      this.status = 'creating';
      onProgress?.('Creating video...');
      
      const response = await synthesia.videos.createVideo(params);
      
      if (response.error) {
        this.handleError(response.error);
        return null;
      }
      
      this.videoId = response.data.id;
      this.status = 'processing';
      onProgress?.('Video created, processing...');
      
      // Wait for completion
      const completedVideo = await this.waitForCompletion(onProgress);
      
      this.status = 'complete';
      onProgress?.('Video completed successfully!');
      
      return completedVideo;
      
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }
  
  private async waitForCompletion(onProgress?: (status: string) => void) {
    let attempts = 0;
    const maxAttempts = 40; // 20 minutes max
    
    while (attempts < maxAttempts) {
      try {
        const response = await synthesia.videos.getVideo(this.videoId!);
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        const video = response.data;
        
        switch (video.status) {
          case 'complete':
            return video;
            
          case 'failed':
            throw new Error('Video generation failed');
            
          case 'in_progress':
            attempts++;
            onProgress?.(`Processing... (${Math.round(attempts * 2.5)}% estimated)`);
            await new Promise(resolve => setTimeout(resolve, 30000));
            break;
        }
        
      } catch (error) {
        if (attempts < 3) {
          // Retry a few times for network errors
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }
    
    throw new Error('Video processing timeout');
  }
  
  private handleError(error: any) {
    this.status = 'error';
    this.error = error;
    
    console.error('Video creation process failed:', error);
    
    // Log error for monitoring
    this.logError(error);
  }
  
  private logError(error: any) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      videoId: this.videoId,
      status: this.status,
      error: {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack
      }
    };
    
    // Send to logging service
    console.log('Error Log:', JSON.stringify(errorLog, null, 2));
  }
  
  getStatus() {
    return {
      status: this.status,
      error: this.error,
      videoId: this.videoId
    };
  }
  
  async retry() {
    if (this.status === 'error' && this.error) {
      // Reset state and retry
      this.status = 'idle';
      this.error = null;
      this.videoId = null;
      
      // Could implement smart retry logic here
      console.log('🔄 Retrying video creation...');
    }
  }
}

// Usage
const videoProcess = new VideoCreationProcess();

const video = await videoProcess.createVideo({
  title: 'My Video',
  scriptText: 'Hello world',
  avatar: 'anna_costume1_cameraA',
  background: 'office'
}, (status) => {
  console.log('Progress:', status);
});

if (!video) {
  const processStatus = videoProcess.getStatus();
  console.error('Process failed:', processStatus.error);
  
  // Allow user to retry
  // await videoProcess.retry();
}
```

## Monitoring and Alerting

### Error Tracking

```typescript
class ErrorTracker {
  private errors: any[] = [];
  
  trackError(error: any, context: any = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      context,
      severity: this.getSeverity(error.statusCode)
    };
    
    this.errors.push(errorEntry);
    
    // Send to monitoring service
    this.sendToMonitoring(errorEntry);
    
    // Alert on critical errors
    if (errorEntry.severity === 'critical') {
      this.sendAlert(errorEntry);
    }
  }
  
  private getSeverity(statusCode: number): 'low' | 'medium' | 'high' | 'critical' {
    if (statusCode >= 500) return 'critical';
    if (statusCode === 429) return 'high';
    if (statusCode >= 400) return 'medium';
    return 'low';
  }
  
  private sendToMonitoring(error: any) {
    // Send to your monitoring service (DataDog, New Relic, etc.)
    console.log('📊 Monitoring:', JSON.stringify(error, null, 2));
  }
  
  private sendAlert(error: any) {
    // Send alerts via email, Slack, PagerDuty, etc.
    console.log('🚨 ALERT:', error.message);
  }
  
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      by_status: {} as Record<number, number>,
      by_severity: {} as Record<string, number>,
      recent: this.errors.filter(e => 
        Date.now() - new Date(e.timestamp).getTime() < 3600000 // Last hour
      ).length
    };
    
    this.errors.forEach(error => {
      stats.by_status[error.statusCode] = (stats.by_status[error.statusCode] || 0) + 1;
      stats.by_severity[error.severity] = (stats.by_severity[error.severity] || 0) + 1;
    });
    
    return stats;
  }
}

// Global error tracker
const errorTracker = new ErrorTracker();

// Use in error handling
async function createVideoWithTracking() {
  try {
    const response = await synthesia.videos.createVideo({
      title: 'My Video',
      scriptText: 'Hello world',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    });
    
    if (response.error) {
      errorTracker.trackError(response.error, {
        operation: 'createVideo',
        params: { title: 'My Video' }
      });
      return null;
    }
    
    return response.data;
    
  } catch (error) {
    errorTracker.trackError(error, {
      operation: 'createVideo',
      type: 'network_error'
    });
    throw error;
  }
}
```

## Best Practices Summary

1. **Always Check for Errors**: Never assume API calls succeed
2. **Provide Fallbacks**: Offer alternatives when possible (e.g., test mode)
3. **Implement Retries**: Use exponential backoff for transient errors
4. **Log Errors**: Track errors for monitoring and debugging
5. **User-Friendly Messages**: Translate technical errors to user language
6. **Handle Rate Limits**: Implement proper backoff strategies
7. **Monitor Health**: Track error rates and patterns
8. **Graceful Degradation**: Keep your app functional even when some features fail

## Next Steps

- [Learn about rate limiting](/synthesia-sdk/guides/rate-limiting/)
- [Implement webhooks for reliable notifications](/synthesia-sdk/guides/webhooks/)
- [Explore advanced examples](/synthesia-sdk/examples/error-handling-examples/)
- [API Reference](/synthesia-sdk/api-reference/)