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
  input: VideoInput[];         // Array of video scenes/clips (required)
  title: string;               // Video title
  description?: string;        // Video description
  visibility: 'public' | 'private'; // Video visibility (required)
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5' | '5:4'; // Video aspect ratio (required)
  test?: boolean;              // Create test video (watermarked)
  ctaSettings?: CTASettings;   // Call-to-action button
  callbackId?: string;         // Custom identifier for linking
  soundtrack?: 'corporate' | 'inspirational' | 'modern' | 'urban'; // Background music
}

interface VideoInput {
  scriptText?: string;         // Text-to-speech script
  scriptAudio?: string;        // Uploaded audio asset ID (alternative to scriptText)
  scriptLanguage?: string;     // Language code (required with scriptAudio)
  avatar: string;              // Avatar ID (required)
  background: string;          // Background ID or asset (required)
  avatarSettings?: AvatarSettings; // Avatar customization
  backgroundSettings?: BackgroundSettings; // Background settings
}
```

#### Example: Simple Video

```typescript
const response = await synthesia.videos.createVideo({
  input: [{
    scriptText: 'Hello! Welcome to our platform. We are excited to have you here!',
    avatar: 'anna_costume1_cameraA',
    background: 'green_screen'
  }],
  title: 'Welcome Video',
  visibility: 'private',
  aspectRatio: '16:9',
  test: true // Remove for production videos
});

if (response.data) {
  console.log('Video created:', response.data.id);
  console.log('Status:', response.data.status);
}
```

#### Example: Multi-Scene Video

```typescript
const response = await synthesia.videos.createVideo({
  input: [
    {
      scriptText: 'Welcome to our product demonstration.',
      avatar: 'anna_costume1_cameraA',
      background: 'office',
      avatarSettings: {
        voice: 'en-US-AriaNeural',
        scale: 1.0,
        horizontalAlign: 'center'
      }
    },
    {
      scriptText: 'Let me show you the key features.',
      avatar: 'james_costume1_cameraA', 
      background: 'white_studio',
      avatarSettings: {
        voice: 'en-US-GuyNeural',
        scale: 1.1,
        horizontalAlign: 'left'
      }
    }
  ],
  title: 'Product Demo',
  visibility: 'public',
  aspectRatio: '16:9',
  ctaSettings: {
    label: 'Learn More',
    url: 'https://example.com/learn-more'
  }
});
```

#### Example: Video with Webhook

```typescript
// First create a webhook
const webhook = await synthesia.webhooks.createWebhook({
  url: 'https://your-server.com/webhook',
  events: ['video.completed', 'video.failed']
});

// Then create video with callback ID for tracking
const response = await synthesia.videos.createVideo({
  input: [{
    scriptText: 'This video will trigger a webhook when complete.',
    avatar: 'anna_costume1_cameraA',
    background: 'green_screen'
  }],
  title: 'Automated Video',
  visibility: 'private',
  aspectRatio: '16:9',
  callbackId: 'user-123-video-abc' // Use for linking back to your system
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
  source?: 'workspace' | 'my_videos' | 'shared_with_me'; // Video source filter
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
  console.log(`Found ${response.data.videos.length} videos`);
  if (response.data.nextOffset) {
    console.log(`Next page offset: ${response.data.nextOffset}`);
  }
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
  console.log('Duration:', video.duration);
  
  if (video.status === 'complete') {
    console.log('Download URL:', video.download);
    if (typeof video.thumbnail === 'object') {
      console.log('Thumbnail:', video.thumbnail?.image);
    } else {
      console.log('Thumbnail:', video.thumbnail);
    }
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
  description?: string;              // New video description
  visibility?: 'public' | 'private'; // New visibility setting
  ctaSettings?: CTASettings;         // Call-to-action settings
}

interface CreateVideoFromTemplateRequest {
  templateId: string;                // Template ID (required)
  templateData: Record<string, any>; // Variable values for template
  title?: string;                    // Video title
  description?: string;              // Video description
  visibility?: 'public' | 'private'; // Video visibility
  callbackId?: string;               // Custom identifier
  ctaSettings?: CTASettings;         // Call-to-action settings
  test?: boolean;                    // Create test video
}

interface GetXLIFFRequest {
  videoVersion?: number;             // Video version to export
  xliffVersion?: '1.2';              // XLIFF version (only 1.2 supported)
}

interface UploadXLIFFRequest {
  videoId: string;                   // Original video ID
  xliffContent: string;              // Translated XLIFF content
  callbackId?: string;               // Optional tracking ID
}

interface TranslatedVideoResponse {
  translatedVideoId: string;         // New translated video ID
  message: string;                   // Confirmation message
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
    visibility: 'private',
    aspectRatio: '16:9',
    test: true
  }
);
```

---

### getVideoXLIFF()

Retrieve XLIFF content for a video for translation purposes.

```typescript
async getVideoXLIFF(videoId: string, options?: GetXLIFFRequest): Promise<APIResponse<string>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `videoId` | `string` | ✅ | The unique video identifier |
| `options` | `GetXLIFFRequest` | ❌ | XLIFF export options |

#### GetXLIFFRequest Interface

```typescript
interface GetXLIFFRequest {
  videoVersion?: number;    // Video version to export (default: latest)
  xliffVersion?: '1.2';     // XLIFF version (only 1.2 supported)
}
```

#### Example

```typescript
const response = await synthesia.videos.getVideoXLIFF('video-123', {
  videoVersion: 1,
  xliffVersion: '1.2'
});

if (response.data) {
  const xliffContent = response.data;
  console.log('XLIFF Content:', xliffContent);
  
  // Save to file or send to translation service
  fs.writeFileSync('video-123.xliff', xliffContent);
}
```

---

### uploadXLIFFTranslation()

Upload translated XLIFF content to create a translated version of a video.

```typescript
async uploadXLIFFTranslation(request: UploadXLIFFRequest): Promise<APIResponse<TranslatedVideoResponse>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | `UploadXLIFFRequest` | ✅ | Translation upload configuration |

#### UploadXLIFFRequest Interface

```typescript
interface UploadXLIFFRequest {
  videoId: string;       // Original video ID
  xliffContent: string;  // Translated XLIFF content in XML format
  callbackId?: string;   // Optional ID for tracking
}
```

#### Example

```typescript
// Read translated XLIFF file
const translatedXLIFF = fs.readFileSync('video-123-es.xliff', 'utf8');

const response = await synthesia.videos.uploadXLIFFTranslation({
  videoId: 'video-123',
  xliffContent: translatedXLIFF,
  callbackId: 'translation-spanish-001'
});

if (response.data) {
  console.log('Translated video ID:', response.data.translatedVideoId);
  console.log('Message:', response.data.message);
}
```

---

## TypeScript Interfaces

### Video

```typescript
interface Video {
  id: string;
  title: string;
  description?: string;
  status: 'in_progress' | 'complete' | 'failed' | 'error' | 'rejected';
  visibility: 'public' | 'private';
  createdAt: number;        // Unix timestamp
  lastUpdatedAt: number;    // Unix timestamp
  download?: string;        // Available when status is 'complete'
  thumbnail?: {             // Available when status is 'complete'
    image?: string;
    gif?: string;
  } | string;
  captions?: {              // Available when status is 'complete'
    srt: string;
    vtt: string;
  };
  duration?: string;        // Video duration (e.g., "0:02:30.204")
  ctaSettings?: CTASettings;
  callbackId?: string;      // Custom identifier
}
```

### VideoInput

```typescript
interface VideoInput {
  scriptText?: string;      // Text-to-speech script
  scriptAudio?: string;     // Uploaded audio asset ID
  scriptLanguage?: string;  // Language code (required with scriptAudio)
  avatar: string;           // Avatar ID (required)
  background: string;       // Background ID or asset (required)
  avatarSettings?: AvatarSettings;
  backgroundSettings?: BackgroundSettings;
}

interface AvatarSettings {
  voice?: string;           // Voice ID
  horizontalAlign?: 'left' | 'center' | 'right';
  scale?: number;           // Avatar scale (default: 1.0)
  style?: 'rectangular' | 'circular';
  backgroundColor?: string; // HEX color for circular style
  seamless?: boolean;       // Seamless looping
}

interface BackgroundSettings {
  videoSettings?: {
    shortBackgroundContentMatchMode?: 'freeze' | 'loop' | 'slow_down';
    longBackgroundContentMatchMode?: 'trim' | 'speed_up';
  };
}
```

### CTASettings

```typescript
interface CTASettings {
  label: string;            // Button/overlay text
  url: string;             // Destination URL
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
  input: [{
    scriptText: 'Testing video creation...',
    avatar: 'anna_costume1_cameraA',
    background: 'green_screen'
  }],
  title: 'Development Test',
  visibility: 'private',
  aspectRatio: '16:9',
  test: true // Creates watermarked video, doesn't count against quota
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
  events: ['video.completed', 'video.failed']
});

// Create video with callback ID for tracking
const video = await synthesia.videos.createVideo({
  input: [{
    scriptText: 'Your script here...',
    avatar: 'anna_costume1_cameraA',
    background: 'office'
  }],
  title: 'Production Video',
  visibility: 'private',
  aspectRatio: '16:9',
  callbackId: 'production-video-123' // Use for linking back to your system
});
```

## Error Handling

```typescript
try {
  const response = await synthesia.videos.createVideo({
    input: [{
      scriptText: 'Hello world!',
      avatar: 'anna_costume1_cameraA',
      background: 'green_screen'
    }],
    title: 'My Video',
    visibility: 'private',
    aspectRatio: '16:9'
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

- [Learn about Templates API](/synthesia-sdk/api-reference/templates/)
- [Set up Webhooks](/synthesia-sdk/api-reference/webhooks/)
