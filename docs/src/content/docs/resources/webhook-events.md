---
title: Webhook Events
description: Complete reference for all webhook events and their payload structures.
sidebar:
  order: 3
---

Complete reference for all webhook events and their payload structures in the Synthesia SDK.

> 📖 **Official Documentation**: [Synthesia Webhook Events](https://docs.synthesia.io/reference/webhook-events)

## Event Types Overview

Synthesia sends webhook events to notify your application about video processing lifecycle changes:

```typescript
type WebhookEvent = 'video.created' | 'video.complete' | 'video.failed';
```

## Event Payload Structure

All webhook events follow this consistent structure:

```typescript
interface WebhookPayload {
  event: WebhookEvent;      // Event type identifier
  data: Video;              // Video object with current state
  timestamp: string;        // ISO 8601 timestamp when event occurred
  webhook_id: string;       // ID of the webhook that triggered this event
}
```

## video.created Event

Triggered when a video creation request is accepted and processing begins.

### When It's Sent

- Immediately after successful video creation API call
- Video validation passes
- Processing queue accepts the request

### Payload Example

```json
{
  "event": "video.created",
  "data": {
    "id": "video-abc123",
    "title": "My New Video",
    "status": "in_progress",
    "visibility": "private",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:05Z",
  "webhook_id": "webhook-xyz789"
}
```

### Usage Example

```typescript
function handleVideoCreated(payload: WebhookPayload) {
  const video = payload.data;
  
  console.log(`🎬 Video creation started: ${video.title}`);
  console.log(`Video ID: ${video.id}`);
  console.log(`Created at: ${video.createdAt}`);
  
  // Update database status
  updateVideoStatus(video.id, 'processing', {
    title: video.title,
    createdAt: video.createdAt,
    status: video.status
  });
  
  // Send notification to user
  notifyUser(video.id, 'Your video is being generated...', 'processing');
  
  // Start progress tracking
  startProgressTracking(video.id);
}
```

## video.complete Event

Triggered when video generation completes successfully.

### When It's Sent

- Video processing finishes successfully
- Download URLs are generated
- Thumbnails and captions are available

### Payload Example

```json
{
  "event": "video.complete",
  "data": {
    "id": "video-abc123",
    "title": "My New Video",
    "status": "complete",
    "visibility": "private",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:30Z",
    "download": "https://download.synthesia.io/videos/video-abc123.mp4",
    "duration": 45,
    "thumbnails": {
      "static": "https://thumbnails.synthesia.io/video-abc123-static.jpg",
      "animated": "https://thumbnails.synthesia.io/video-abc123-animated.gif"
    },
    "captions": {
      "srt": "https://captions.synthesia.io/video-abc123.srt",
      "vtt": "https://captions.synthesia.io/video-abc123.vtt"
    },
    "ctaSettings": {
      "label": "Learn More",
      "url": "https://example.com/learn-more",
      "style": "button"
    }
  },
  "timestamp": "2024-01-15T10:35:35Z",
  "webhook_id": "webhook-xyz789"
}
```

### Usage Example

```typescript
async function handleVideoComplete(payload: WebhookPayload) {
  const video = payload.data;
  
  console.log(`✅ Video completed: ${video.title}`);
  console.log(`Duration: ${video.duration} seconds`);
  console.log(`Download URL: ${video.download}`);
  
  // Update database with completion data
  await updateVideoStatus(video.id, 'completed', {
    downloadUrl: video.download,
    duration: video.duration,
    thumbnailUrl: video.thumbnails?.static,
    captionsUrl: video.captions?.srt,
    completedAt: video.updatedAt
  });
  
  // Download and store video file
  if (video.download) {
    await downloadAndStoreVideo(video);
  }
  
  // Send completion notification
  await notifyUser(video.id, 'Your video is ready!', 'completed', {
    downloadUrl: video.download,
    thumbnailUrl: video.thumbnails?.static
  });
  
  // Trigger post-processing workflows
  await triggerPostProcessing(video);
}

async function downloadAndStoreVideo(video: any) {
  try {
    console.log(`📥 Downloading video: ${video.id}`);
    
    const response = await fetch(video.download);
    const buffer = await response.arrayBuffer();
    
    // Store in your preferred storage (AWS S3, etc.)
    const storagePath = await storeVideoFile(video.id, buffer);
    
    console.log(`💾 Video stored at: ${storagePath}`);
    
    // Update database with local storage path
    await updateVideoStorage(video.id, storagePath);
    
  } catch (error) {
    console.error(`❌ Failed to download video ${video.id}:`, error);
    
    // Log error for retry later
    await logVideoDownloadError(video.id, error);
  }
}
```

## video.failed Event

Triggered when video generation fails due to processing errors.

### When It's Sent

- Processing encounters an unrecoverable error
- Content validation fails during processing
- System resource limitations are reached

### Payload Example

```json
{
  "event": "video.failed",
  "data": {
    "id": "video-abc123",
    "title": "My New Video",
    "status": "failed",
    "visibility": "private",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:32:15Z"
  },
  "timestamp": "2024-01-15T10:32:20Z",
  "webhook_id": "webhook-xyz789"
}
```

### Usage Example

```typescript
async function handleVideoFailed(payload: WebhookPayload) {
  const video = payload.data;
  
  console.error(`❌ Video generation failed: ${video.title}`);
  console.error(`Video ID: ${video.id}`);
  console.error(`Failed at: ${video.updatedAt}`);
  
  // Update database status
  await updateVideoStatus(video.id, 'failed', {
    failedAt: video.updatedAt,
    error: 'Video generation failed during processing'
  });
  
  // Notify user of failure
  await notifyUser(video.id, 'Video generation failed', 'failed', {
    supportMessage: 'Please contact support if this continues to happen.'
  });
  
  // Log failure for analysis
  await logVideoFailure(video.id, {
    title: video.title,
    createdAt: video.createdAt,
    failedAt: video.updatedAt,
    processingTime: calculateProcessingTime(video.createdAt, video.updatedAt)
  });
  
  // Implement retry logic if appropriate
  await handleFailureRetry(video);
}

async function handleFailureRetry(video: any) {
  // Get retry count from database
  const retryCount = await getVideoRetryCount(video.id);
  const maxRetries = 2;
  
  if (retryCount < maxRetries) {
    console.log(`🔄 Attempting retry ${retryCount + 1}/${maxRetries} for video ${video.id}`);
    
    // Increment retry count
    await incrementVideoRetryCount(video.id);
    
    // Get original video parameters
    const originalParams = await getOriginalVideoParams(video.id);
    
    if (originalParams) {
      // Create new video with same parameters
      const retryResponse = await synthesia.videos.createVideo({
        ...originalParams,
        title: `${originalParams.title} (Retry ${retryCount + 1})`
      });
      
      if (retryResponse.data) {
        // Link retry to original request
        await linkRetryVideo(video.id, retryResponse.data.id);
        console.log(`✅ Retry video created: ${retryResponse.data.id}`);
      }
    }
  } else {
    console.log(`❌ Max retries exceeded for video ${video.id}`);
    await markVideoAsUnrecoverable(video.id);
  }
}
```

## Event Handling Patterns

### Complete Event Handler

```typescript
async function handleWebhookEvent(payload: WebhookPayload) {
  const { event, data: video, timestamp, webhook_id } = payload;
  
  console.log(`📧 Received ${event} for video ${video.id} at ${timestamp}`);
  
  try {
    switch (event) {
      case 'video.created':
        await handleVideoCreated(payload);
        break;
        
      case 'video.complete':
        await handleVideoComplete(payload);
        break;
        
      case 'video.failed':
        await handleVideoFailed(payload);
        break;
        
      default:
        console.warn(`❓ Unknown event type: ${event}`);
    }
    
    // Log successful processing
    await logWebhookEvent(event, video.id, true);
    
  } catch (error) {
    console.error(`❌ Failed to process ${event} for video ${video.id}:`, error);
    
    // Log failed processing
    await logWebhookEvent(event, video.id, false, error);
    
    throw error; // Re-throw to trigger webhook retry
  }
}
```

### Event-Driven State Management

```typescript
class VideoStateManager {
  private videoStates = new Map<string, string>();
  private eventHandlers = new Map<string, Function[]>();
  
  constructor() {
    // Register default handlers
    this.on('video.created', this.onVideoCreated.bind(this));
    this.on('video.complete', this.onVideoComplete.bind(this));
    this.on('video.failed', this.onVideoFailed.bind(this));
  }
  
  on(event: WebhookEvent, handler: (payload: WebhookPayload) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }
  
  async processEvent(payload: WebhookPayload) {
    const { event, data: video } = payload;
    
    // Update video state
    this.videoStates.set(video.id, video.status);
    
    // Execute registered handlers
    const handlers = this.eventHandlers.get(event) || [];
    
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`Handler failed for ${event}:`, error);
      }
    }
  }
  
  private async onVideoCreated(payload: WebhookPayload) {
    const video = payload.data;
    console.log(`🎬 Starting processing for: ${video.title}`);
    
    // Start progress tracking
    this.startProgressTracking(video.id);
  }
  
  private async onVideoComplete(payload: WebhookPayload) {
    const video = payload.data;
    console.log(`✅ Completed: ${video.title}`);
    
    // Stop progress tracking
    this.stopProgressTracking(video.id);
    
    // Trigger completion workflows
    await this.triggerCompletionWorkflows(video);
  }
  
  private async onVideoFailed(payload: WebhookPayload) {
    const video = payload.data;
    console.error(`❌ Failed: ${video.title}`);
    
    // Stop progress tracking
    this.stopProgressTracking(video.id);
    
    // Trigger failure workflows
    await this.triggerFailureWorkflows(video);
  }
  
  private progressTrackingIntervals = new Map<string, NodeJS.Timeout>();
  
  private startProgressTracking(videoId: string) {
    // Clear existing interval
    this.stopProgressTracking(videoId);
    
    // Start new interval
    const interval = setInterval(async () => {
      await this.updateProgress(videoId);
    }, 30000); // Check every 30 seconds
    
    this.progressTrackingIntervals.set(videoId, interval);
  }
  
  private stopProgressTracking(videoId: string) {
    const interval = this.progressTrackingIntervals.get(videoId);
    if (interval) {
      clearInterval(interval);
      this.progressTrackingIntervals.delete(videoId);
    }
  }
  
  private async updateProgress(videoId: string) {
    // Optional: Poll video status for progress updates
    // This is mainly for fallback if webhooks fail
    try {
      const response = await synthesia.videos.getVideo(videoId);
      if (response.data && response.data.status !== 'in_progress') {
        this.stopProgressTracking(videoId);
      }
    } catch (error) {
      console.error(`Failed to check progress for ${videoId}:`, error);
    }
  }
  
  getVideoState(videoId: string): string | undefined {
    return this.videoStates.get(videoId);
  }
}

// Usage
const stateManager = new VideoStateManager();

// Add custom handlers
stateManager.on('video.complete', async (payload) => {
  // Custom completion logic
  await sendSlackNotification(`Video ${payload.data.title} is ready!`);
});

stateManager.on('video.failed', async (payload) => {
  // Custom failure logic
  await sendErrorAlert(`Video ${payload.data.title} failed to generate`);
});

// Process webhook events
app.post('/webhooks/synthesia', express.json(), async (req, res) => {
  try {
    await stateManager.processEvent(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Event processing failed:', error);
    res.status(500).send('Processing failed');
  }
});
```

## Event Timing and Expectations

### Typical Processing Times

| Video Type | Typical Duration | Expected Processing Time |
|------------|------------------|-------------------------|
| Test video (30s max) | 10-30 seconds | 1-3 minutes |
| Short video (1 minute) | ~60 seconds | 2-5 minutes |
| Medium video (3 minutes) | ~180 seconds | 5-10 minutes |
| Long video (10 minutes) | ~600 seconds | 15-30 minutes |

### Event Sequence Timeline

```typescript
// Typical event flow for successful video creation
const typicalEventFlow = [
  {
    event: 'video.created',
    timing: 'Immediate (< 5 seconds after API call)',
    videoStatus: 'in_progress'
  },
  {
    event: 'video.complete',
    timing: '2-10 minutes later (depending on video length)',
    videoStatus: 'complete'
  }
];

// Failed video flow
const failedEventFlow = [
  {
    event: 'video.created',
    timing: 'Immediate (< 5 seconds after API call)',
    videoStatus: 'in_progress'
  },
  {
    event: 'video.failed',
    timing: '30 seconds - 5 minutes later',
    videoStatus: 'failed'
  }
];
```

## Error Handling and Reliability

### Webhook Delivery Guarantees

```typescript
// Synthesia webhook delivery behavior
const deliveryBehavior = {
  retryAttempts: 3,
  retryIntervals: [30, 300, 1800], // 30s, 5min, 30min
  timeout: 10000, // 10 second timeout per attempt
  expectedResponseCodes: [200, 201, 202], // Success codes
  failureCodes: [4XX, 5XX] // Codes that trigger retries
};
```

### Handling Duplicate Events

```typescript
class DuplicateEventFilter {
  private processedEvents = new Set<string>();
  private eventExpiry = 24 * 60 * 60 * 1000; // 24 hours
  
  constructor() {
    // Clean up old events periodically
    setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
  }
  
  isDuplicate(payload: WebhookPayload): boolean {
    const eventKey = this.generateEventKey(payload);
    return this.processedEvents.has(eventKey);
  }
  
  markAsProcessed(payload: WebhookPayload) {
    const eventKey = this.generateEventKey(payload);
    this.processedEvents.add(eventKey);
  }
  
  private generateEventKey(payload: WebhookPayload): string {
    // Create unique key from event type, video ID, and timestamp
    return `${payload.event}:${payload.data.id}:${payload.timestamp}`;
  }
  
  private cleanup() {
    // In a real implementation, you'd track timestamps and remove old events
    // For now, just clear all to prevent memory leaks
    if (this.processedEvents.size > 10000) {
      this.processedEvents.clear();
    }
  }
}

// Usage in webhook handler
const duplicateFilter = new DuplicateEventFilter();

app.post('/webhooks/synthesia', express.json(), async (req, res) => {
  const payload = req.body;
  
  // Check for duplicates
  if (duplicateFilter.isDuplicate(payload)) {
    console.log('🔄 Duplicate event ignored:', payload.event, payload.data.id);
    return res.status(200).send('OK'); // Still return success
  }
  
  try {
    await handleWebhookEvent(payload);
    duplicateFilter.markAsProcessed(payload);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Event processing failed:', error);
    res.status(500).send('Processing failed');
  }
});
```

## Event Monitoring and Analytics

### Event Metrics Tracking

```typescript
class WebhookMetrics {
  private eventCounts = new Map<string, number>();
  private processingTimes = new Map<string, number[]>();
  private failures = new Map<string, number>();
  
  recordEvent(event: WebhookEvent, processingTimeMs: number, success: boolean) {
    // Count events
    this.eventCounts.set(event, (this.eventCounts.get(event) || 0) + 1);
    
    // Track processing times
    if (!this.processingTimes.has(event)) {
      this.processingTimes.set(event, []);
    }
    this.processingTimes.get(event)!.push(processingTimeMs);
    
    // Track failures
    if (!success) {
      this.failures.set(event, (this.failures.get(event) || 0) + 1);
    }
  }
  
  getMetrics() {
    const metrics = {
      totalEvents: Array.from(this.eventCounts.values()).reduce((sum, count) => sum + count, 0),
      eventBreakdown: Object.fromEntries(this.eventCounts),
      averageProcessingTimes: {} as Record<string, number>,
      failureRates: {} as Record<string, number>
    };
    
    // Calculate average processing times
    for (const [event, times] of this.processingTimes.entries()) {
      metrics.averageProcessingTimes[event] = times.reduce((sum, time) => sum + time, 0) / times.length;
    }
    
    // Calculate failure rates
    for (const [event, failureCount] of this.failures.entries()) {
      const totalCount = this.eventCounts.get(event) || 1;
      metrics.failureRates[event] = (failureCount / totalCount) * 100;
    }
    
    return metrics;
  }
}

const metrics = new WebhookMetrics();

// Enhanced webhook handler with metrics
app.post('/webhooks/synthesia', express.json(), async (req, res) => {
  const startTime = Date.now();
  const payload = req.body;
  let success = false;
  
  try {
    await handleWebhookEvent(payload);
    success = true;
    res.status(200).send('OK');
  } catch (error) {
    console.error('Event processing failed:', error);
    res.status(500).send('Processing failed');
  } finally {
    const processingTime = Date.now() - startTime;
    metrics.recordEvent(payload.event, processingTime, success);
  }
});

// Metrics endpoint
app.get('/metrics/webhooks', (req, res) => {
  res.json(metrics.getMetrics());
});
```

## Testing Webhook Events

### Webhook Testing Setup

```typescript
// Test webhook handler
async function testWebhookHandler(eventType: WebhookEvent, videoData: Partial<Video>) {
  const testPayload: WebhookPayload = {
    event: eventType,
    data: {
      id: 'test-video-123',
      title: 'Test Video',
      status: eventType === 'video.complete' ? 'complete' : 
              eventType === 'video.failed' ? 'failed' : 'in_progress',
      visibility: 'private',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...videoData
    } as Video,
    timestamp: new Date().toISOString(),
    webhook_id: 'test-webhook-456'
  };
  
  console.log(`🧪 Testing ${eventType} event...`);
  
  try {
    await handleWebhookEvent(testPayload);
    console.log(`✅ ${eventType} test passed`);
  } catch (error) {
    console.error(`❌ ${eventType} test failed:`, error);
  }
}

// Run tests
async function runWebhookTests() {
  await testWebhookHandler('video.created', {});
  
  await testWebhookHandler('video.complete', {
    download: 'https://example.com/test-video.mp4',
    duration: 45,
    thumbnails: {
      static: 'https://example.com/thumbnail.jpg',
      animated: 'https://example.com/thumbnail.gif'
    },
    captions: {
      srt: 'https://example.com/captions.srt',
      vtt: 'https://example.com/captions.vtt'
    }
  });
  
  await testWebhookHandler('video.failed', {});
}
```

## Next Steps

- [Set up webhook endpoints](../guides/webhooks.md)
- [Learn about video lifecycle](../guides/video-lifecycle.md)
- [Explore webhook examples](../examples/webhook-integrations.md)
- [Read the Webhooks API reference](../api-reference/webhooks.md)