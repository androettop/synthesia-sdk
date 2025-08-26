---
title: Webhooks API
description: Receive real-time notifications about video processing events.
sidebar:
  order: 3
---

The Webhooks API allows you to receive real-time notifications about video processing events, eliminating the need for constant polling.

> 📖 **Official API Documentation**: [Synthesia Webhooks API](https://docs.synthesia.io/reference/create-webhook)

## Overview

Webhooks provide efficient event-driven notifications when:
- Videos complete processing
- Video generation fails
- Videos are created

This enables you to build responsive applications that react immediately to video status changes.

## Methods

### createWebhook()

Create a new webhook endpoint to receive event notifications.

```typescript
async createWebhook(request: CreateWebhookRequest): Promise<APIResponse<Webhook>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | `CreateWebhookRequest` | ✅ | Webhook configuration |

#### CreateWebhookRequest Interface

```typescript
interface CreateWebhookRequest {
  url: string;              // Your webhook endpoint URL
  events: WebhookEvent[];   // Events to subscribe to
  secret?: string;          // Optional secret for signature verification
}

type WebhookEvent = 'video.created' | 'video.complete' | 'video.failed';
```

#### Example

```typescript
const response = await synthesia.webhooks.createWebhook({
  url: 'https://your-app.com/webhooks/synthesia',
  events: ['video.complete', 'video.failed'],
  secret: 'your-webhook-secret-key'
});

if (response.data) {
  console.log('Webhook created:', response.data.id);
  console.log('Active:', response.data.active);
  
  // Store webhook ID for future use
  const webhookId = response.data.id;
}
```

---

### listWebhooks()

Retrieve all webhooks configured for your account.

```typescript
async listWebhooks(): Promise<APIResponse<ListWebhooksResponse>>
```

#### Example

```typescript
const response = await synthesia.webhooks.listWebhooks();

if (response.data) {
  console.log(`Found ${response.data.count} webhooks`);
  
  response.data.webhooks.forEach(webhook => {
    console.log(`- ID: ${webhook.id}`);
    console.log(`  URL: ${webhook.url}`);
    console.log(`  Events: ${webhook.events.join(', ')}`);
    console.log(`  Active: ${webhook.active}`);
    console.log(`  Created: ${webhook.createdAt}`);
  });
}
```

---

### getWebhook()

Retrieve details for a specific webhook.

```typescript
async getWebhook(webhookId: string): Promise<APIResponse<Webhook>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `webhookId` | `string` | ✅ | The unique webhook identifier |

#### Example

```typescript
const response = await synthesia.webhooks.getWebhook('webhook-123');

if (response.data) {
  const webhook = response.data;
  console.log('Webhook URL:', webhook.url);
  console.log('Events:', webhook.events);
  console.log('Status:', webhook.active ? 'Active' : 'Inactive');
  console.log('Last Updated:', webhook.updatedAt);
}
```

---

### updateWebhook()

> ⚠️ **Note**: Update webhook is not available in the current API. To modify a webhook, delete the existing one and create a new one.

```typescript
// Not available - use delete and create instead
// async updateWebhook(webhookId: string, request: Partial<CreateWebhookRequest>): Promise<APIResponse<Webhook>>
```

#### Alternative: Delete and Recreate

```typescript
// To "update" a webhook, delete and recreate it
const deleteResponse = await synthesia.webhooks.deleteWebhook('webhook-123');

if (!deleteResponse.error) {
  const newResponse = await synthesia.webhooks.createWebhook({
    url: 'https://new-domain.com/webhooks/synthesia',
    events: ['video.created', 'video.complete', 'video.failed'],
    secret: 'your-webhook-secret'
  });
  
  console.log('Webhook recreated:', newResponse.data?.id);
}

// Add a secret to existing webhook
const response = await synthesia.webhooks.updateWebhook('webhook-123', {
  secret: 'new-secret-key'
});
```

---

### deleteWebhook()

Delete a webhook permanently.

```typescript
async deleteWebhook(webhookId: string): Promise<APIResponse<void>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `webhookId` | `string` | ✅ | The unique webhook identifier |

#### Example

```typescript
const response = await synthesia.webhooks.deleteWebhook('webhook-123');

if (!response.error) {
  console.log('Webhook deleted successfully');
}
```

## Webhook Events

### Event Types

| Event | Description | Payload |
|-------|-------------|---------|
| `video.created` | Video creation started | Video object with `in_progress` status |
| `video.complete` | Video generation completed | Video object with `complete` status and download URLs |
| `video.failed` | Video generation failed | Video object with `failed` status and error details |

### Event Payload Structure

```typescript
interface WebhookPayload {
  event: WebhookEvent;          // Event type
  data: Video;                  // Video object
  timestamp: string;            // ISO timestamp
  webhook_id: string;           // Webhook that triggered this event
}
```

### Example Event Payloads

#### video.created
```json
{
  "event": "video.created",
  "data": {
    "id": "video-123",
    "title": "My Video",
    "status": "in_progress",
    "visibility": "private",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "webhook_id": "webhook-456"
}
```

#### video.complete
```json
{
  "event": "video.complete",
  "data": {
    "id": "video-123",
    "title": "My Video",
    "status": "complete",
    "visibility": "private",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:00Z",
    "download": "https://download.synthesia.io/video-123.mp4",
    "duration": 45,
    "thumbnails": {
      "static": "https://thumbnails.synthesia.io/video-123-static.jpg",
      "animated": "https://thumbnails.synthesia.io/video-123-animated.gif"
    },
    "captions": {
      "srt": "https://captions.synthesia.io/video-123.srt",
      "vtt": "https://captions.synthesia.io/video-123.vtt"
    }
  },
  "timestamp": "2024-01-15T10:35:00Z",
  "webhook_id": "webhook-456"
}
```

#### video.failed
```json
{
  "event": "video.failed",
  "data": {
    "id": "video-123",
    "title": "My Video",
    "status": "failed",
    "visibility": "private",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:32:00Z"
  },
  "timestamp": "2024-01-15T10:32:00Z",
  "webhook_id": "webhook-456"
}
```

## Webhook Security

### Signature Verification

When you provide a secret during webhook creation, Synthesia signs each webhook payload:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return `sha256=${expectedSignature}` === signature;
}

// Express.js example
app.post('/webhooks/synthesia', express.raw({ type: 'application/json' }), (req, res) => {
  const payload = req.body.toString();
  const signature = req.headers['x-synthesia-signature'] as string;
  const secret = 'your-webhook-secret';
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  // Process webhook event...
  
  res.status(200).send('OK');
});
```

### TypeScript Interfaces

```typescript
interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;              // Not returned in API responses
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

interface ListWebhooksResponse {
  webhooks: Webhook[];
  count: number;
}
```

## Implementation Examples

### Express.js Webhook Handler

```typescript
import express from 'express';
import { Synthesia } from '@androettop/synthesia-sdk';

const app = express();
const synthesia = new Synthesia({ apiKey: process.env.SYNTHESIA_API_KEY! });

// Webhook endpoint
app.post('/webhooks/synthesia', express.json(), async (req, res) => {
  try {
    const { event, data: video, timestamp } = req.body;
    
    console.log(`Received ${event} for video ${video.id}`);
    
    switch (event) {
      case 'video.created':
        console.log(`Video creation started: ${video.title}`);
        // Update database status
        await updateVideoStatus(video.id, 'processing');
        break;
        
      case 'video.complete':
        console.log(`Video completed: ${video.title}`);
        console.log(`Download URL: ${video.download}`);
        
        // Update database with completion data
        await updateVideoStatus(video.id, 'completed', {
          downloadUrl: video.download,
          duration: video.duration,
          thumbnailUrl: video.thumbnails?.static
        });
        
        // Trigger post-processing (email notifications, etc.)
        await notifyVideoCompletion(video);
        break;
        
      case 'video.failed':
        console.error(`Video generation failed: ${video.title}`);
        
        // Update database and notify user
        await updateVideoStatus(video.id, 'failed');
        await notifyVideoFailure(video);
        break;
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function updateVideoStatus(videoId: string, status: string, metadata?: any) {
  // Update your database
  console.log(`Updating video ${videoId} status to ${status}`);
}

async function notifyVideoCompletion(video: any) {
  // Send email, push notification, etc.
  console.log(`Notifying completion of video: ${video.title}`);
}

async function notifyVideoFailure(video: any) {
  // Handle failure notifications
  console.log(`Notifying failure of video: ${video.title}`);
}
```

### Next.js API Route

```typescript
// pages/api/webhooks/synthesia.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { event, data: video } = req.body;
    
    // Process webhook event
    switch (event) {
      case 'video.complete':
        // Download and store video
        await downloadAndStoreVideo(video);
        break;
        
      case 'video.failed':
        // Log error and retry if needed
        await handleVideoFailure(video);
        break;
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function downloadAndStoreVideo(video: any) {
  if (!video.download) return;
  
  // Download video file
  const response = await fetch(video.download);
  const buffer = await response.arrayBuffer();
  
  // Store in your preferred storage (AWS S3, etc.)
  console.log(`Storing video ${video.id}, size: ${buffer.byteLength} bytes`);
}
```

### Webhook Management Helper

```typescript
class WebhookManager {
  constructor(private synthesia: Synthesia) {}
  
  async setupProductionWebhook(baseUrl: string): Promise<string> {
    // Check if webhook already exists
    const existing = await this.findWebhookByUrl(`${baseUrl}/webhooks/synthesia`);
    
    if (existing) {
      console.log('Webhook already exists:', existing.id);
      return existing.id;
    }
    
    // Create new webhook
    const response = await this.synthesia.webhooks.createWebhook({
      url: `${baseUrl}/webhooks/synthesia`,
      events: ['video.complete', 'video.failed'],
      secret: process.env.WEBHOOK_SECRET
    });
    
    if (response.error) {
      throw new Error(`Failed to create webhook: ${response.error.message}`);
    }
    
    console.log('Created webhook:', response.data!.id);
    return response.data!.id;
  }
  
  async findWebhookByUrl(url: string): Promise<Webhook | null> {
    const response = await this.synthesia.webhooks.listWebhooks();
    
    if (response.error || !response.data) {
      return null;
    }
    
    return response.data.webhooks.find(w => w.url === url) || null;
  }
  
  async testWebhook(webhookId: string): Promise<boolean> {
    // Create a test video to trigger webhook
    const videoResponse = await this.synthesia.videos.createVideo({
      test: true,
      title: 'Webhook Test Video',
      scriptText: 'Testing webhook functionality',
      avatar: 'anna_costume1_cameraA',
      background: 'green_screen',
      webhookId
    });
    
    return !!videoResponse.data;
  }
}

// Usage
const webhookManager = new WebhookManager(synthesia);
const webhookId = await webhookManager.setupProductionWebhook('https://your-app.com');
```

## Best Practices

### 1. Idempotency

Handle duplicate webhook deliveries gracefully:

```typescript
const processedEvents = new Set<string>();

app.post('/webhooks/synthesia', express.json(), (req, res) => {
  const eventId = req.headers['x-synthesia-delivery-id'] as string;
  
  if (processedEvents.has(eventId)) {
    console.log('Duplicate event, ignoring');
    return res.status(200).send('OK');
  }
  
  processedEvents.add(eventId);
  
  // Process event...
  res.status(200).send('OK');
});
```

### 2. Error Handling

Implement proper error handling and retries:

```typescript
app.post('/webhooks/synthesia', express.json(), async (req, res) => {
  try {
    await processWebhookEvent(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    // Return 5xx status to trigger Synthesia's retry mechanism
    res.status(500).send('Processing failed');
  }
});
```

### 3. Async Processing

Use queues for heavy processing:

```typescript
import { Queue } from 'bull';

const videoProcessingQueue = new Queue('video processing');

app.post('/webhooks/synthesia', express.json(), async (req, res) => {
  // Quickly acknowledge webhook
  res.status(200).send('OK');
  
  // Queue heavy processing
  await videoProcessingQueue.add('process-video-event', req.body);
});
```

## Error Handling

```typescript
try {
  const response = await synthesia.webhooks.createWebhook({
    url: 'https://invalid-url',
    events: ['video.complete']
  });
  
  if (response.error) {
    switch (response.error.statusCode) {
      case 400:
        console.error('Invalid webhook URL or configuration');
        break;
      case 429:
        console.error('Rate limit exceeded');
        break;
      default:
        console.error('API Error:', response.error.message);
    }
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

## Next Steps

- [Set up webhook handling](/synthesia-sdk/guides/webhooks/)
