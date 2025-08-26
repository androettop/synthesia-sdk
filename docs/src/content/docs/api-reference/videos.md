---
title: Videos API
description: Create, manage, and retrieve AI-generated videos programmatically.
sidebar:
  order: 1
---

The Videos API allows you to create, manage, and retrieve AI-generated videos programmatically.

> 📖 **Official API Documentation**: [Synthesia Videos API](https://docs.synthesia.io/reference/create-video)

## Overview

Videos are the core resource in Synthesia. You can create videos using:
- Simple script text with a selected avatar and background
- Advanced scene configurations with multiple avatars
- Templates with variable data
- Custom voice settings and call-to-action buttons

## Methods

### createVideo()

Create a new video with custom content.

```typescript
async createVideo(request: CreateVideoRequest): Promise<APIResponse<Video>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | `CreateVideoRequest` | ✅ | Video creation configuration |

#### CreateVideoRequest Interface

```typescript
interface CreateVideoRequest {
  test?: boolean;              // Create test video (watermarked, 30s max)
  title: string;               // Video title
  scriptText?: string;         // Simple script text for single scene
  avatar?: string;             // Avatar ID for simple videos
  background?: string;         // Background for simple videos  
  scenes?: Scene[];            // Advanced: multiple scenes
  template?: TemplateConfig;   // Use template instead of scenes
  webhookId?: string;          // Webhook to notify on completion
  visibility?: 'public' | 'private'; // Video visibility
  ctaSettings?: CTASettings;   // Call-to-action button
}
```

#### Example: Simple Video

```typescript
const response = await synthesia.videos.createVideo({
  test: true, // Remove for production videos
  title: 'Welcome Video',
  scriptText: 'Hello! Welcome to our platform. We are excited to have you here!',
  avatar: 'anna_costume1_cameraA',
  background: 'green_screen',
  visibility: 'private'
});

if (response.data) {
  console.log('Video created:', response.data.id);
  console.log('Status:', response.data.status);
}
```

#### Example: Multi-Scene Video

```typescript
const response = await synthesia.videos.createVideo({
  title: 'Product Demo',
  scenes: [
    {
      avatar: 'anna_costume1_cameraA',
      background: 'office',
      script: 'Welcome to our product demonstration.',
      voiceSettings: {
        speed: 1.1,
        pitch: 0.95
      }
    },
    {
      avatar: 'james_costume1_cameraA', 
      background: 'white_studio',
      script: 'Let me show you the key features.',
      voiceSettings: {
        speed: 1.0,
        pitch: 1.0
      }
    }
  ],
  ctaSettings: {
    label: 'Learn More',
    url: 'https://example.com/learn-more',
    style: 'button'
  }
});
```

#### Example: Video with Webhook

```typescript
// First create a webhook
const webhook = await synthesia.webhooks.createWebhook({
  url: 'https://your-server.com/webhook',
  events: ['video.complete', 'video.failed']
});

// Then create video with webhook notification
const response = await synthesia.videos.createVideo({
  title: 'Automated Video',
  scriptText: 'This video will trigger a webhook when complete.',
  avatar: 'anna_costume1_cameraA',
  background: 'green_screen',
  webhookId: webhook.data?.id
});
```

---

### listVideos()

Retrieve a list of videos from your account.

```typescript
async listVideos(request?: ListVideosRequest): Promise<APIResponse<ListVideosResponse>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | `ListVideosRequest` | ❌ | Filtering and pagination options |

#### ListVideosRequest Interface

```typescript
interface ListVideosRequest {
  source?: 'workspace' | 'personal' | 'shared'; // Video source filter
  offset?: number;   // Pagination offset
  limit?: number;    // Results per page (max 100)
}
```

#### Example

```typescript
// Get all videos
const response = await synthesia.videos.listVideos();

// Get workspace videos with pagination
const response = await synthesia.videos.listVideos({
  source: 'workspace',
  limit: 10,
  offset: 0
});

if (response.data) {
  console.log(`Found ${response.data.count} videos`);
  response.data.videos.forEach(video => {
    console.log(`- ${video.title} (${video.status})`);
  });
}
```

---

### getVideo()

Retrieve details for a specific video.

```typescript
async getVideo(videoId: string): Promise<APIResponse<Video>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `videoId` | `string` | ✅ | The unique video identifier |

#### Example

```typescript
const response = await synthesia.videos.getVideo('video-123');

if (response.data) {
  const video = response.data;
  console.log('Title:', video.title);
  console.log('Status:', video.status);
  console.log('Duration:', video.duration, 'seconds');
  
  if (video.status === 'complete') {
    console.log('Download URL:', video.download);
    console.log('Thumbnail:', video.thumbnails?.static);
  }
}
```

---

### updateVideo()

Update video properties like title and visibility.

```typescript
async updateVideo(videoId: string, request: UpdateVideoRequest): Promise<APIResponse<Video>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `videoId` | `string` | ✅ | The unique video identifier |
| `request` | `UpdateVideoRequest` | ✅ | Properties to update |

#### UpdateVideoRequest Interface

```typescript
interface UpdateVideoRequest {
  title?: string;                    // New video title
  visibility?: 'public' | 'private'; // New visibility setting
}
```

#### Example

```typescript
const response = await synthesia.videos.updateVideo('video-123', {
  title: 'Updated Video Title',
  visibility: 'public'
});

if (response.data) {
  console.log('Video updated successfully');
}
```

---

### deleteVideo()

Permanently delete a video.

```typescript
async deleteVideo(videoId: string): Promise<APIResponse<void>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `videoId` | `string` | ✅ | The unique video identifier |

#### Example

```typescript
const response = await synthesia.videos.deleteVideo('video-123');

if (!response.error) {
  console.log('Video deleted successfully');
}
```

---

### createVideoFromTemplate()

Create a video using a template with variable data.

```typescript
async createVideoFromTemplate(
  templateId: string,
  data: Record<string, any>,
  options?: Partial<CreateVideoRequest>
): Promise<APIResponse<Video>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateId` | `string` | ✅ | Template identifier |
| `data` | `Record<string, any>` | ✅ | Variable values for the template |
| `options` | `Partial<CreateVideoRequest>` | ❌ | Additional video options |

#### Example

```typescript
// Get template details first
const template = await synthesia.templates.getTemplate('template-123');

// Create video from template
const response = await synthesia.videos.createVideoFromTemplate(
  'template-123',
  {
    // Fill template variables
    'customer_name': 'John Doe',
    'product_name': 'Premium Plan',
    'discount_code': 'SAVE20'
  },
  {
    title: 'Personalized Welcome Video for John',
    test: true,
    visibility: 'private'
  }
);
```

## TypeScript Interfaces

### Video

```typescript
interface Video {
  id: string;
  title: string;
  status: 'in_progress' | 'complete' | 'failed';
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
  download?: string;        // Available when status is 'complete'
  thumbnails?: {
    static: string;
    animated: string;
  };
  captions?: {              // Available when status is 'complete'
    srt: string;
    vtt: string;
  };
  duration?: number;        // Video duration in seconds
  ctaSettings?: CTASettings;
}
```

### Scene

```typescript
interface Scene {
  avatar: string;           // Avatar ID
  background: string;       // Background ID
  script: string;          // Scene script text
  voiceSettings?: {
    speed?: number;         // Voice speed (0.5 - 2.0)
    pitch?: number;         // Voice pitch (0.5 - 2.0)
  };
}
```

### CTASettings

```typescript
interface CTASettings {
  label: string;            // Button/overlay text
  url: string;             // Destination URL
  style?: 'button' | 'overlay'; // Display style
}
```

## Video Statuses

| Status | Description |
|--------|-------------|
| `in_progress` | Video is being generated |
| `complete` | Video is ready for download |
| `failed` | Video generation failed |

## Best Practices

### 1. Use Test Mode for Development

```typescript
// Always use test mode during development
const video = await synthesia.videos.createVideo({
  test: true, // Creates watermarked video, doesn't count against quota
  title: 'Development Test',
  scriptText: 'Testing video creation...',
  avatar: 'anna_costume1_cameraA',
  background: 'green_screen'
});
```

### 2. Handle Video Status Polling

```typescript
async function waitForVideoCompletion(videoId: string): Promise<Video> {
  while (true) {
    const response = await synthesia.videos.getVideo(videoId);
    
    if (!response.data) {
      throw new Error('Video not found');
    }
    
    const video = response.data;
    
    if (video.status === 'complete') {
      return video;
    } else if (video.status === 'failed') {
      throw new Error('Video generation failed');
    }
    
    // Wait 30 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}
```

### 3. Use Webhooks for Production

Instead of polling, use webhooks for efficient video completion notifications:

```typescript
// Create webhook once
const webhook = await synthesia.webhooks.createWebhook({
  url: 'https://your-app.com/webhook/synthesia',
  events: ['video.complete', 'video.failed']
});

// Use webhook ID in video creation
const video = await synthesia.videos.createVideo({
  title: 'Production Video',
  scriptText: 'Your script here...',
  avatar: 'anna_costume1_cameraA',
  background: 'office',
  webhookId: webhook.data?.id
});
```

## Error Handling

```typescript
try {
  const response = await synthesia.videos.createVideo({
    title: 'My Video',
    scriptText: 'Hello world!',
    avatar: 'anna_costume1_cameraA',
    background: 'green_screen'
  });
  
  if (response.error) {
    console.error('API Error:', response.error.message);
    console.error('Status Code:', response.error.statusCode);
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

## Next Steps

- [Learn about Templates API](./templates.md)
- [Set up Webhooks](./webhooks.md)
- [Explore advanced examples](../examples/advanced-usage.md)