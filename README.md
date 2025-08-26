# Synthesia TypeScript SDK

A comprehensive TypeScript SDK for the Synthesia API that allows you to create AI-generated videos programmatically.

## Features

- 🎥 **Video Creation**: Create videos with custom scripts, avatars, and backgrounds
- 📋 **Template Support**: Use Synthesia templates for quick video generation
- 🔗 **Webhook Management**: Set up webhooks to receive video processing notifications
- 📁 **Asset Upload**: Upload audio, image, and video assets
- 🔒 **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Comprehensive Testing**: Complete test suite for all endpoints
- 🚨 **Error Handling**: Robust error handling with custom error types
- ⚡ **Rate Limit Handling**: Built-in rate limit information tracking

## 📖 Documentation

For comprehensive documentation, guides, and examples, visit: **[https://androettop.github.io/synthesia-sdk](https://androettop.github.io/synthesia-sdk)**

## Installation

```bash
npm install @androettop/synthesia-sdk
```

## Quick Start

```typescript
import { Synthesia } from "@androettop/synthesia-sdk";

const synthesia = new Synthesia({
  apiKey: "your-api-key-here",
});

// Create a simple video
const result = await synthesia.videos.createVideo({
  title: "My First Video",
  scriptText: "Hello world! This is my first Synthesia video.",
  avatar: "anna_costume1_cameraA",
  background: "green_screen",
  test: true, // Use test mode for development
});

if (result.error) {
  console.error("Error:", result.error.message);
} else {
  console.log("Video created:", result.data.id);
}
```

## API Reference

### Configuration

```typescript
const synthesia = new Synthesia({
  apiKey: "your-api-key", // Required: Your Synthesia API key
  baseURL: "https://custom.api", // Optional: Custom API base URL
});
```

### Videos API

#### Create Video

```typescript
const result = await synthesia.videos.createVideo({
  title: "Video Title",
  scriptText: "Your script text",
  avatar: "anna_costume1_cameraA",
  background: "green_screen",
  test: true, // Optional: test mode
  visibility: "private", // Optional: 'public' | 'private'
  webhookId: "webhook-id", // Optional: webhook for notifications
});
```

#### List Videos

```typescript
const result = await synthesia.videos.listVideos({
  source: "workspace", // Optional: 'workspace' | 'personal' | 'shared'
  limit: 10, // Optional: number of videos to return
  offset: 0, // Optional: pagination offset
});
```

#### Get Video

```typescript
const result = await synthesia.videos.getVideo("video-id");
```

#### Update Video

```typescript
const result = await synthesia.videos.updateVideo("video-id", {
  title: "New Title",
  visibility: "public",
});
```

#### Delete Video

```typescript
const result = await synthesia.videos.deleteVideo("video-id");
```

#### Create Video from Template

```typescript
const result = await synthesia.videos.createVideoFromTemplate(
  "template-id",
  {
    // Template variables
    name: "John Doe",
    company: "Acme Corp",
  },
  {
    title: "Personalized Video",
    test: true,
  }
);
```

### Templates API

#### List Templates

```typescript
const result = await synthesia.templates.listTemplates({
  source: "synthesia", // Optional: 'synthesia' | 'workspace'
});
```

#### Get Template

```typescript
const result = await synthesia.templates.getTemplate("template-id");
```

### Webhooks API

#### Create Webhook

```typescript
const result = await synthesia.webhooks.createWebhook({
  url: "https://your-app.com/webhook",
  events: ["video.complete", "video.failed"],
  secret: "your-webhook-secret", // Optional but recommended
});
```

#### List Webhooks

```typescript
const result = await synthesia.webhooks.listWebhooks();
```

#### Get Webhook

```typescript
const result = await synthesia.webhooks.getWebhook("webhook-id");
```

#### Update Webhook

```typescript
const result = await synthesia.webhooks.updateWebhook("webhook-id", {
  events: ["video.complete"],
});
```

#### Delete Webhook

```typescript
const result = await synthesia.webhooks.deleteWebhook("webhook-id");
```

### Uploads API

#### Upload Asset

```typescript
const file = new Blob(["audio data"], { type: "audio/mpeg" });
const result = await synthesia.uploads.uploadAsset({
  file,
  filename: "audio.mp3",
  type: "audio",
});
```

#### Upload Script Audio

```typescript
const audioFile = new Blob(["audio data"], { type: "audio/mpeg" });
const result = await synthesia.uploads.uploadScriptAudio(
  audioFile,
  "script.mp3"
);
```

## Error Handling

The SDK provides comprehensive error handling with custom error types:

```typescript
import {
  SynthesiaSDKError,
  ValidationError,
  AuthenticationError,
} from "@androettop/synthesia-sdk";

try {
  const result = await synthesia.videos.createVideo({
    title: "Test Video",
  });

  if (result.error) {
    throw SynthesiaSDKError.fromResponse(result.error);
  }
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Authentication failed:", error.message);
  } else if (error instanceof ValidationError) {
    console.error("Validation error:", error.message, error.details);
  } else if (error instanceof SynthesiaSDKError) {
    console.error("Synthesia API error:", error.message);

    if (error.isRateLimited()) {
      console.log("Rate limited, retry after:", error.retryAfter);
    }
  }
}
```

## Utilities

The SDK includes utility functions for common tasks:

```typescript
import { SynthesiaUtils } from "@androettop/synthesia-sdk";

// Validate webhook signatures
const isValid = SynthesiaUtils.validateWebhookSignature(
  payload,
  signature,
  secret
);

// Poll video status until completion
const finalStatus = await SynthesiaUtils.pollVideoStatus(
  (id) => synthesia.videos.getVideo(id),
  "video-id",
  {
    maxAttempts: 60,
    intervalMs: 10000,
    onStatusUpdate: (status) => console.log("Status:", status),
  }
);
```

## Rate Limiting

Track rate limit information:

```typescript
const result = await synthesia.videos.createVideo(videoData);
const rateLimitInfo = synthesia.getRateLimitInfo();

if (rateLimitInfo) {
  console.log("Rate limit:", rateLimitInfo.limit);
  console.log("Remaining:", rateLimitInfo.remaining);
  console.log("Reset at:", rateLimitInfo.resetAt);
}
```

## Webhook Handling

Example webhook handler:

```typescript
import { SynthesiaUtils } from "@androettop/synthesia-sdk";
import express from "express";

const app = express();

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const payload = req.body.toString();
  const signature = req.headers["x-signature"] as string;
  const secret = "your-webhook-secret";

  if (!SynthesiaUtils.validateWebhookSignature(payload, signature, secret)) {
    return res.status(401).send("Invalid signature");
  }

  const data = JSON.parse(payload);

  switch (data.event) {
    case "video.complete":
      console.log("Video completed:", data.video.id);
      // Handle video completion
      break;

    case "video.failed":
      console.log("Video failed:", data.video.id);
      // Handle video failure
      break;
  }

  res.status(200).send("OK");
});
```

## Examples

Check the `examples/` directory for complete usage examples:

- `basic-usage.ts` - Basic video creation and management
- `template-usage.ts` - Working with templates
- `webhook-usage.ts` - Setting up and handling webhooks

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run linting
npm run lint
```

## API Coverage

This SDK implements all available Synthesia API endpoints:

### Videos API ✅

- [x] Create Video
- [x] List Videos
- [x] Get Video
- [x] Update Video
- [x] Delete Video
- [x] Create Video from Template

### Templates API ✅

- [x] List Templates
- [x] Get Template

### Webhooks API ✅

- [x] Create Webhook
- [x] List Webhooks
- [x] Get Webhook
- [x] Update Webhook
- [x] Delete Webhook

### Upload API ✅

- [x] Upload Assets
- [x] Get Asset
- [x] Delete Asset

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Support

For issues with this SDK, please create an issue on GitHub.

For Synthesia API questions, consult the [official documentation](https://docs.synthesia.io/).
