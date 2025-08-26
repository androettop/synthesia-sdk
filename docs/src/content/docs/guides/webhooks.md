---
title: Setting Up Webhooks
description: Learn how to implement webhooks to receive real-time notifications.
sidebar:
  order: 3
---

Learn how to implement webhooks to receive real-time notifications about video processing events, eliminating the need for constant polling.

> 📖 **Official API Documentation**: [Synthesia Webhooks](https://docs.synthesia.io/reference/create-webhook)

## Why Use Webhooks?

Instead of continuously polling the API to check video status, webhooks allow Synthesia to notify your application immediately when events occur:

✅ **Efficient** - No need for constant API polling  
✅ **Real-time** - Instant notifications when videos complete  
✅ **Reliable** - Built-in retry mechanism for failed deliveries  
✅ **Scalable** - Handle multiple videos without performance issues  

## Quick Start

### 1. Create a Webhook Endpoint

First, create an endpoint in your application to receive webhook events:

```typescript
// Express.js example
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhooks/synthesia', (req, res) => {
  const { event, data: video, timestamp } = req.body;
  
  console.log(`Received ${event} for video ${video.id}`);
  
  switch (event) {
    case 'video.complete':
      console.log('✅ Video completed:', video.download);
      // Handle completed video (save URL, notify user, etc.)
      break;
      
    case 'video.failed':
      console.error('❌ Video failed:', video.id);
      // Handle failed video (retry, notify user, etc.)
      break;
      
    case 'video.created':
      console.log('🎬 Video creation started:', video.id);
      // Handle video creation (update status, etc.)
      break;
  }
  
  // Always respond with 200 to acknowledge receipt
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### 2. Register the Webhook

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});

async function setupWebhook() {
  const response = await synthesia.webhooks.createWebhook({
    url: 'https://your-app.com/webhooks/synthesia',
    events: ['video.complete', 'video.failed'],
    secret: 'your-webhook-secret-key' // Optional but recommended
  });
  
  if (response.data) {
    console.log('✅ Webhook created:', response.data.id);
    console.log('URL:', response.data.url);
    console.log('Events:', response.data.events);
    
    // Store webhook ID for future reference
    process.env.SYNTHESIA_WEBHOOK_ID = response.data.id;
  }
}

setupWebhook();
```

### 3. Use Webhook in Video Creation

```typescript
async function createVideoWithWebhook() {
  const response = await synthesia.videos.createVideo({
    title: 'Video with Webhook',
    scriptText: 'This video will trigger a webhook when complete.',
    avatar: 'anna_costume1_cameraA',
    background: 'office',
    webhookId: process.env.SYNTHESIA_WEBHOOK_ID // Use registered webhook
  });
  
  if (response.data) {
    console.log('Video created:', response.data.id);
    console.log('Will notify webhook when complete');
  }
}
```

## Complete Implementation Guide

### Express.js + TypeScript

```typescript
import express from 'express';
import crypto from 'crypto';
import { Synthesia } from '@androettop/synthesia-sdk';

const app = express();
const synthesia = new Synthesia({ apiKey: process.env.SYNTHESIA_API_KEY! });

// Middleware to capture raw body for signature verification
app.use('/webhooks/synthesia', express.raw({ type: 'application/json' }));
app.use(express.json()); // For other routes

// Webhook endpoint with signature verification
app.post('/webhooks/synthesia', async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-synthesia-signature'] as string;
    const payload = req.body.toString();
    
    if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET!)) {
      console.error('Invalid webhook signature');
      return res.status(401).send('Unauthorized');
    }
    
    // Parse the verified payload
    const { event, data: video, timestamp, webhook_id } = JSON.parse(payload);
    
    console.log(`📧 Webhook received: ${event} for video ${video.id}`);
    
    // Handle the event
    await handleWebhookEvent(event, video, timestamp);
    
    // Acknowledge receipt
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
});

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return `sha256=${expectedSignature}` === signature;
}

async function handleWebhookEvent(event: string, video: any, timestamp: string) {
  switch (event) {
    case 'video.created':
      await handleVideoCreated(video);
      break;
      
    case 'video.complete':
      await handleVideoComplete(video);
      break;
      
    case 'video.failed':
      await handleVideoFailed(video);
      break;
      
    default:
      console.log(`Unknown event: ${event}`);
  }
}

async function handleVideoCreated(video: any) {
  console.log(`🎬 Video creation started: ${video.title}`);
  
  // Update database status
  await updateVideoStatus(video.id, 'processing', {
    title: video.title,
    status: video.status,
    createdAt: video.createdAt
  });
}

async function handleVideoComplete(video: any) {
  console.log(`✅ Video completed: ${video.title}`);
  console.log(`📥 Download URL: ${video.download}`);
  
  // Update database with completion data
  await updateVideoStatus(video.id, 'completed', {
    downloadUrl: video.download,
    duration: video.duration,
    thumbnailUrl: video.thumbnails?.static,
    captionsUrl: video.captions?.srt,
    updatedAt: video.updatedAt
  });
  
  // Trigger post-processing
  await postProcessVideo(video);
}

async function handleVideoFailed(video: any) {
  console.error(`❌ Video generation failed: ${video.title}`);
  
  // Update database
  await updateVideoStatus(video.id, 'failed', {
    updatedAt: video.updatedAt
  });
  
  // Notify user or trigger retry logic
  await notifyVideoFailure(video);
}

// Database update function (implement according to your DB)
async function updateVideoStatus(videoId: string, status: string, metadata: any) {
  console.log(`Updating video ${videoId} status to ${status}`);
  // Your database update logic here
}

// Post-processing function
async function postProcessVideo(video: any) {
  // Download and store video file
  if (video.download) {
    await downloadAndStoreVideo(video);
  }
  
  // Send email notification
  await sendCompletionEmail(video);
  
  // Trigger other workflows
  await triggerPostProcessingWorkflows(video);
}

async function downloadAndStoreVideo(video: any) {
  try {
    const response = await fetch(video.download);
    const buffer = await response.arrayBuffer();
    
    // Store in your preferred storage (AWS S3, etc.)
    console.log(`📁 Storing video ${video.id}, size: ${buffer.byteLength} bytes`);
    
    // Your storage logic here
    
  } catch (error) {
    console.error('Failed to download video:', error);
  }
}

app.listen(3000, () => {
  console.log('🚀 Webhook server running on port 3000');
});
```

### Next.js API Route

```typescript
// pages/api/webhooks/synthesia.ts or app/api/webhooks/synthesia/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Verify signature
    const signature = req.headers['x-synthesia-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    if (!verifySignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const { event, data: video } = req.body;
    
    // Process the webhook event
    await processWebhookEvent(event, video);
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.SYNTHESIA_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return `sha256=${expectedSignature}` === signature;
}

async function processWebhookEvent(event: string, video: any) {
  // Your event processing logic
  console.log(`Processing ${event} for video ${video.id}`);
}
```

## Webhook Management

### Creating Production Webhooks

```typescript
class WebhookManager {
  constructor(private synthesia: Synthesia) {}
  
  async setupProductionWebhook(config: {
    baseUrl: string;
    events?: string[];
    secret?: string;
  }) {
    const webhookUrl = `${config.baseUrl}/webhooks/synthesia`;
    
    // Check if webhook already exists
    const existingWebhook = await this.findWebhookByUrl(webhookUrl);
    
    if (existingWebhook) {
      console.log('✅ Webhook already exists:', existingWebhook.id);
      return existingWebhook.id;
    }
    
    // Create new webhook
    const response = await this.synthesia.webhooks.createWebhook({
      url: webhookUrl,
      events: config.events || ['video.complete', 'video.failed'],
      secret: config.secret || process.env.SYNTHESIA_WEBHOOK_SECRET
    });
    
    if (response.error) {
      throw new Error(`Failed to create webhook: ${response.error.message}`);
    }
    
    console.log('✅ Created new webhook:', response.data!.id);
    return response.data!.id;
  }
  
  async findWebhookByUrl(url: string) {
    const response = await this.synthesia.webhooks.listWebhooks();
    
    if (response.error || !response.data) {
      return null;
    }
    
    return response.data.webhooks.find(webhook => webhook.url === url) || null;
  }
  
  async updateWebhookEvents(webhookId: string, events: string[]) {
    // Note: Update is not available, must delete and recreate
    const webhook = await this.synthesia.webhooks.getWebhook(webhookId);
    if (webhook.data) {
      await this.synthesia.webhooks.deleteWebhook(webhookId);
      return this.synthesia.webhooks.createWebhook({
        url: webhook.data.url,
        events,
        secret: webhook.data.secret
      });
    }
    throw new Error('Webhook not found');
  }
  
  async deleteWebhook(webhookId: string) {
    return this.synthesia.webhooks.deleteWebhook(webhookId);
  }
}

// Usage
const webhookManager = new WebhookManager(synthesia);

const webhookId = await webhookManager.setupProductionWebhook({
  baseUrl: 'https://your-app.com',
  events: ['video.created', 'video.complete', 'video.failed'],
  secret: process.env.SYNTHESIA_WEBHOOK_SECRET
});

// Store webhook ID for video creation
process.env.SYNTHESIA_WEBHOOK_ID = webhookId;
```

### Testing Webhooks

```typescript
async function testWebhook(webhookId: string) {
  console.log('🧪 Testing webhook with a test video...');
  
  const response = await synthesia.videos.createVideo({
    test: true, // Creates a quick test video
    title: 'Webhook Test Video',
    scriptText: 'This is a test video to verify webhook functionality.',
    avatar: 'anna_costume1_cameraA',
    background: 'green_screen',
    webhookId: webhookId
  });
  
  if (response.data) {
    console.log(`✅ Test video created: ${response.data.id}`);
    console.log('📧 Webhook should receive notifications shortly');
    return response.data.id;
  } else {
    console.error('❌ Failed to create test video');
    return null;
  }
}
```

## Event Handling Patterns

### Event Queue Pattern

```typescript
import Queue from 'bull';

const videoEventQueue = new Queue('video events', {
  redis: { port: 6379, host: '127.0.0.1' }
});

// Webhook endpoint - quickly queue events
app.post('/webhooks/synthesia', (req, res) => {
  // Acknowledge webhook immediately
  res.status(200).send('OK');
  
  // Queue event for processing
  videoEventQueue.add('process-event', req.body, {
    attempts: 3,
    backoff: 'exponential',
    delay: 1000
  });
});

// Process events asynchronously
videoEventQueue.process('process-event', async (job) => {
  const { event, data: video } = job.data;
  
  console.log(`Processing ${event} for video ${video.id}`);
  
  switch (event) {
    case 'video.complete':
      await handleVideoComplete(video);
      break;
    case 'video.failed':
      await handleVideoFailed(video);
      break;
  }
});

videoEventQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

videoEventQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});
```

### Database Integration Pattern

```typescript
// Using Prisma as an example
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handleVideoComplete(video: any) {
  try {
    // Update video record
    await prisma.video.update({
      where: { synthesia_id: video.id },
      data: {
        status: 'completed',
        download_url: video.download,
        duration: video.duration,
        thumbnail_url: video.thumbnails?.static,
        completed_at: new Date(video.updatedAt)
      }
    });
    
    // Create notification for user
    const videoRecord = await prisma.video.findUnique({
      where: { synthesia_id: video.id },
      include: { user: true }
    });
    
    if (videoRecord) {
      await prisma.notification.create({
        data: {
          user_id: videoRecord.user_id,
          type: 'video_complete',
          title: 'Video Ready!',
          message: `Your video "${video.title}" is ready for download.`,
          data: { video_id: video.id, download_url: video.download }
        }
      });
      
      // Send email notification
      await sendVideoCompleteEmail(videoRecord.user.email, video);
    }
    
  } catch (error) {
    console.error('Database update failed:', error);
    throw error; // Re-throw to trigger webhook retry
  }
}
```

### Real-time Updates Pattern

```typescript
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*" }
});

// Store user connections
const userSockets = new Map<string, string>();

io.on('connection', (socket) => {
  socket.on('join-user', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} connected`);
  });
  
  socket.on('disconnect', () => {
    // Remove user from map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

async function handleVideoComplete(video: any) {
  // Update database
  await updateVideoInDatabase(video);
  
  // Find video owner
  const videoRecord = await getVideoFromDatabase(video.id);
  
  if (videoRecord) {
    // Send real-time update to user
    const userSocketId = userSockets.get(videoRecord.user_id);
    
    if (userSocketId) {
      io.to(userSocketId).emit('video-complete', {
        videoId: video.id,
        title: video.title,
        downloadUrl: video.download,
        thumbnailUrl: video.thumbnails?.static
      });
    }
  }
}
```

## Security Best Practices

### 1. Always Verify Signatures

```typescript
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !signature.startsWith('sha256=')) {
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  const receivedSignature = signature.slice(7); // Remove 'sha256='
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many webhook requests, please try again later.'
});

app.use('/webhooks', webhookLimiter);
```

### 3. Idempotency

```typescript
const processedEvents = new Set<string>();

app.post('/webhooks/synthesia', (req, res) => {
  const eventId = req.headers['x-synthesia-delivery-id'] as string;
  
  if (processedEvents.has(eventId)) {
    console.log('🔄 Duplicate event, ignoring');
    return res.status(200).send('OK');
  }
  
  processedEvents.add(eventId);
  
  // Process event...
  
  res.status(200).send('OK');
});
```

## Error Handling and Retry Logic

### Webhook Response Handling

```typescript
app.post('/webhooks/synthesia', async (req, res) => {
  try {
    await processWebhookEvent(req.body);
    
    // Always return 200 for successful processing
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    // Return 5xx status to trigger Synthesia's retry
    res.status(500).send('Processing failed');
  }
});
```

### Retry with Exponential Backoff

```typescript
async function processWithRetry(event: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await processWebhookEvent(event);
      return; // Success
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        // Final attempt failed
        await logFailedEvent(event, error);
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Monitoring and Debugging

### Webhook Logs

```typescript
function logWebhookEvent(event: string, video: any, success: boolean, error?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    videoId: video.id,
    videoTitle: video.title,
    success,
    error: error?.message,
    duration: video.duration,
    status: video.status
  };
  
  console.log('📊 Webhook Event:', JSON.stringify(logEntry, null, 2));
  
  // Store in monitoring system
  // Example: send to logging service, database, etc.
}
```

### Health Check Endpoint

```typescript
app.get('/webhooks/health', async (req, res) => {
  try {
    // Check webhook status
    const webhooks = await synthesia.webhooks.listWebhooks();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      webhooks: webhooks.data?.count || 0,
      processed_events: processedEvents.size
    };
    
    res.json(healthStatus);
    
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook URL**: Ensure it's publicly accessible
2. **Verify HTTPS**: Webhooks require HTTPS in production
3. **Check firewall**: Ensure port is open
4. **Test with ngrok**: Use ngrok for local development

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the HTTPS URL for webhook registration
```

### Events Not Processing

1. **Check logs**: Look for processing errors
2. **Verify signature**: Ensure signature verification is working
3. **Test response codes**: Always return 200 for success
4. **Check rate limits**: Ensure you're not hitting API limits

### Duplicate Events

```typescript
// Use delivery ID to prevent duplicates
const deliveryId = req.headers['x-synthesia-delivery-id'];
if (processedDeliveries.has(deliveryId)) {
  return res.status(200).send('Already processed');
}
processedDeliveries.add(deliveryId);
```

## Next Steps

- [Implement error handling patterns](/synthesia-sdk/guides/error-handling/)
- [Learn about rate limiting](/synthesia-sdk/guides/rate-limiting/)
- [API Reference: Webhooks](/synthesia-sdk/api-reference/webhooks/)