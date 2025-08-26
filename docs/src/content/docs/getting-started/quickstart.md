---
title: Quickstart Guide
description: Get up and running with the Synthesia SDK in minutes.
sidebar:
  order: 2
---

Get up and running with the Synthesia SDK in minutes. This guide follows the same steps as the [official API quickstart](https://docs.synthesia.io/reference/synthesia-api-quickstart) but using the SDK.

## 🚀 Quick Start

### 1. Install the SDK

```bash
npm install @androettop/synthesia-sdk
```

### 2. Get Your API Key

1. Log into your [Synthesia account](https://app.synthesia.io/)
2. Navigate to **Integrations**
3. Click **"Add"** to generate a new API key
4. Copy and securely store your API key

### 3. Create Your First Video

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

// Initialize the SDK
const synthesia = new Synthesia({
  apiKey: 'your-api-key-here',
});

// Create your first video
async function createFirstVideo() {
  try {
    const result = await synthesia.videos.createVideo({
      input: [{
        scriptText: 'Hello, World! This is my first synthetic video, made with the Synthesia API!',
        avatar: 'anna_costume1_cameraA',
        background: 'green_screen'
      }],
      test: true, // Use test mode for development
      title: 'My first Synthetic video',
      visibility: 'private',
      aspectRatio: '16:9'
    });

    if (result.error) {
      console.error('Error creating video:', result.error.message);
      return;
    }

    const video = result.data!;
    console.log('✅ Video created successfully!');
    console.log('Video ID:', video.id);
    console.log('Status:', video.status);
    
    return video.id;
  } catch (error) {
    console.error('❌ Failed to create video:', error);
  }
}

createFirstVideo();
```

### 4. Monitor Video Processing

Videos take 3-5 minutes to process. You can poll the status:

```typescript
async function waitForVideo(videoId: string) {
  console.log('🎬 Video is processing...');
  
  let attempts = 0;
  const maxAttempts = 60; // 10 minutes max
  
  while (attempts < maxAttempts) {
    const result = await synthesia.videos.getVideo(videoId);
    
    if (result.error) {
      console.error('Error checking video:', result.error.message);
      break;
    }

    const video = result.data!;
    console.log(`Status: ${video.status} (attempt ${attempts + 1}/${maxAttempts})`);

    if (video.status === 'complete') {
      console.log('✅ Video is ready!');
      console.log('Download URL:', video.download);
      return video;
    }

    if (video.status === 'failed') {
      console.log('❌ Video processing failed');
      break;
    }

    // Wait 10 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 10000));
    attempts++;
  }
}

// Usage
const videoId = await createFirstVideo();
if (videoId) {
  await waitForVideo(videoId);
}
```

### 5. Download Your Video

Once the video is complete, download it:

```typescript
async function downloadVideo(videoId: string) {
  const result = await synthesia.videos.getVideo(videoId);
  
  if (result.error || !result.data?.download) {
    console.error('Video not ready for download');
    return;
  }

  const downloadUrl = result.data.download;
  
  // Download using fetch (Node.js 18+) or axios
  const response = await fetch(downloadUrl);
  const videoBuffer = await response.arrayBuffer();
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('my_first_synthetic_video.mp4', Buffer.from(videoBuffer));
  
  console.log('✅ Video downloaded successfully!');
}
```

## 🛠 Complete Example

Here's a complete example that creates, monitors, and downloads a video:

```typescript
import { Synthesia, SynthesiaUtils } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY!,
});

async function main() {
  try {
    // 1. Create video
    console.log('🎬 Creating video...');
    const createResult = await synthesia.videos.createVideo({
      input: [{
        scriptText: 'Hello, World! This is my first synthetic video, made with the Synthesia API!',
        avatar: 'anna_costume1_cameraA',
        background: 'green_screen'
      }],
      test: true,
      title: 'My first Synthetic video',
      visibility: 'private',
      aspectRatio: '16:9'
    });

    if (createResult.error) {
      throw new Error(createResult.error.message);
    }

    const videoId = createResult.data!.id;
    console.log('✅ Video created:', videoId);

    // 2. Wait for completion using utility function
    console.log('⏳ Waiting for video to complete...');
    const finalStatus = await SynthesiaUtils.pollVideoStatus(
      (id) => synthesia.videos.getVideo(id),
      videoId,
      {
        maxAttempts: 60,
        intervalMs: 10000,
        onStatusUpdate: (status) => console.log(`Status: ${status}`),
      }
    );

    if (finalStatus === 'complete') {
      console.log('🎉 Video completed successfully!');
      
      // 3. Get final video details
      const videoResult = await synthesia.videos.getVideo(videoId);
      const video = videoResult.data!;
      
      console.log('📹 Video details:');
      console.log('- Title:', video.title);
      console.log('- Duration:', video.duration, 'seconds');
      console.log('- Download URL:', video.download);
      
      if (video.thumbnails) {
        console.log('- Thumbnail:', video.thumbnails.static);
      }
      
    } else {
      console.log('❌ Video processing failed');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
```

## 🔄 Alternative: Using Webhooks

Instead of polling, you can set up webhooks to get notified when videos are ready:

```typescript
// Set up webhook (do this once)
async function setupWebhook() {
  const webhook = await synthesia.webhooks.createWebhook({
    url: 'https://your-app.com/webhooks/synthesia',
    events: ['video.completed', 'video.failed'],
    secret: 'your-webhook-secret',
  });

  if (webhook.error) {
    console.error('Failed to create webhook:', webhook.error.message);
  } else {
    console.log('✅ Webhook created:', webhook.data!.id);
  }
}
```

## 📝 Next Steps

Now that you've created your first video, explore more features:

- [🎭 Working with Templates](/synthesia-sdk/guides/templates/)
- [🔗 Setting Up Webhooks](/synthesia-sdk/guides/webhooks/)
- [📤 Uploading Assets](/synthesia-sdk/api-reference/uploads/)

## 🔗 Official Documentation

This quickstart is based on the official Synthesia API documentation:
- [API Quickstart Guide](https://docs.synthesia.io/reference/synthesia-api-quickstart)
- [Create Video Endpoint](https://docs.synthesia.io/reference/create-video)

## 💡 Tips

- Always use `test: true` during development to avoid using your quota
- Store your API key securely in environment variables
- Use webhooks for production applications instead of polling
- Check rate limits with `synthesia.getRateLimitInfo()`