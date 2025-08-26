---
title: Creating Your First Video
description: Learn how to create your first AI-generated video using the Synthesia SDK.
sidebar:
  order: 1
---

Learn how to create your first AI-generated video using the Synthesia SDK with step-by-step examples.

> 📖 **Official API Documentation**: [Synthesia API Quickstart](https://docs.synthesia.io/reference/synthesia-api-quickstart)

## Quick Start

The fastest way to create a video is using simple text, an avatar, and a background:

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});

async function createFirstVideo() {
  const response = await synthesia.videos.createVideo({
    test: true, // Creates a watermarked test video
    title: 'My First Synthesia Video',
    scriptText: 'Hello! This is my first AI-generated video using Synthesia.',
    avatar: 'anna_costume1_cameraA',
    background: 'green_screen',
    visibility: 'private'
  });

  if (response.data) {
    console.log('✅ Video created successfully!');
    console.log('Video ID:', response.data.id);
    console.log('Status:', response.data.status);
    return response.data.id;
  } else {
    console.error('❌ Failed to create video:', response.error?.message);
  }
}

createFirstVideo();
```

## Step-by-Step Tutorial

### Step 1: Install and Set Up the SDK

```bash
npm install @androettop/synthesia-sdk
```

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: 'your-api-key-here', // Get from https://app.synthesia.io/
});
```

### Step 2: Create a Simple Video

```typescript
const response = await synthesia.videos.createVideo({
  // Essential parameters
  title: 'Welcome Video',
  scriptText: 'Welcome to our platform! We are excited to have you here.',
  
  // Avatar and background selection
  avatar: 'anna_costume1_cameraA',
  background: 'office',
  
  // Development settings
  test: true,          // Remove for production videos
  visibility: 'private' // or 'public'
});
```

### Step 3: Check Video Status

Videos are generated asynchronously. Check the status:

```typescript
if (response.data) {
  const videoId = response.data.id;
  
  // Poll for completion
  const checkStatus = async () => {
    const statusResponse = await synthesia.videos.getVideo(videoId);
    
    if (statusResponse.data) {
      const video = statusResponse.data;
      console.log('Status:', video.status);
      
      switch (video.status) {
        case 'in_progress':
          console.log('⏳ Video is being generated...');
          // Check again in 30 seconds
          setTimeout(checkStatus, 30000);
          break;
          
        case 'complete':
          console.log('✅ Video is ready!');
          console.log('Download URL:', video.download);
          console.log('Thumbnail:', video.thumbnails?.static);
          break;
          
        case 'failed':
          console.log('❌ Video generation failed');
          break;
      }
    }
  };
  
  checkStatus();
}
```

### Step 4: Complete Example

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});

async function createAndWaitForVideo() {
  try {
    // Create video
    console.log('Creating video...');
    const response = await synthesia.videos.createVideo({
      test: true,
      title: 'My First Video',
      scriptText: `
        Hello and welcome! This is my first AI-generated video.
        I'm excited to explore the possibilities of synthetic media.
        Thank you for watching!
      `,
      avatar: 'anna_costume1_cameraA',
      background: 'green_screen',
      visibility: 'private'
    });

    if (!response.data) {
      throw new Error(response.error?.message || 'Failed to create video');
    }

    const videoId = response.data.id;
    console.log(`✅ Video created: ${videoId}`);

    // Wait for completion
    console.log('⏳ Waiting for video to complete...');
    const completedVideo = await waitForVideoCompletion(videoId);
    
    console.log('🎉 Video completed successfully!');
    console.log('Download URL:', completedVideo.download);
    console.log('Duration:', completedVideo.duration, 'seconds');
    
    return completedVideo;
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function waitForVideoCompletion(videoId: string, maxWaitTime = 600000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const response = await synthesia.videos.getVideo(videoId);
    
    if (!response.data) {
      throw new Error('Video not found');
    }
    
    const video = response.data;
    
    switch (video.status) {
      case 'complete':
        return video;
        
      case 'failed':
        throw new Error('Video generation failed');
        
      case 'in_progress':
        console.log('Still processing... ⏳');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
        break;
    }
  }
  
  throw new Error('Video generation timed out');
}

// Run the example
createAndWaitForVideo()
  .then(video => {
    console.log('Success! Video URL:', video.download);
  })
  .catch(error => {
    console.error('Failed:', error.message);
  });
```

## Choosing Avatars and Backgrounds

### Popular Avatars

```typescript
// Professional avatars
'anna_costume1_cameraA'     // Professional woman
'james_costume1_cameraA'    // Professional man  
'sophia_costume1_cameraA'   // Young professional woman
'david_costume1_cameraA'    // Mature professional man

// Casual avatars
'anna_costume2_cameraA'     // Casual Anna
'james_costume2_cameraA'    // Casual James
```

### Background Options

```typescript
// Studio backgrounds
'white_studio'              // Clean white background
'green_screen'              // Green screen for custom backgrounds
'office'                    // Professional office setting
'modern_office'             // Contemporary office space

// Custom backgrounds
'library'                   // Classic library setting
'conference_room'           // Meeting room environment
```

### Avatar and Background Combinations

```typescript
// Professional presentation
{
  avatar: 'anna_costume1_cameraA',
  background: 'office'
}

// Casual explainer video
{
  avatar: 'james_costume2_cameraA', 
  background: 'white_studio'
}

// Educational content
{
  avatar: 'sophia_costume1_cameraA',
  background: 'library'
}
```

## Adding Voice Customization

```typescript
const response = await synthesia.videos.createVideo({
  title: 'Custom Voice Settings',
  scenes: [{
    avatar: 'anna_costume1_cameraA',
    background: 'office',
    script: 'This video demonstrates custom voice settings.',
    voiceSettings: {
      speed: 1.1,    // Slightly faster (0.5 - 2.0)
      pitch: 0.95    // Slightly lower pitch (0.5 - 2.0)
    }
  }],
  test: true
});
```

## Error Handling Best Practices

```typescript
async function createVideoSafely() {
  try {
    const response = await synthesia.videos.createVideo({
      title: 'Test Video',
      scriptText: 'Hello world!',
      avatar: 'anna_costume1_cameraA',
      background: 'office',
      test: true
    });

    // Check for API errors
    if (response.error) {
      console.error('API Error:', response.error.message);
      console.error('Status Code:', response.error.statusCode);
      
      // Handle specific errors
      switch (response.error.statusCode) {
        case 400:
          console.error('Invalid request parameters');
          break;
        case 401:
          console.error('Invalid API key');
          break;
        case 429:
          console.error('Rate limit exceeded');
          break;
        case 500:
          console.error('Server error');
          break;
      }
      
      return null;
    }

    return response.data;
    
  } catch (error) {
    // Handle network errors
    console.error('Network Error:', error);
    return null;
  }
}
```

## Development vs Production

### Test Videos (Development)

```typescript
// Test videos are watermarked and limited to 30 seconds
const testVideo = await synthesia.videos.createVideo({
  test: true,           // ✅ Always use for development
  title: 'Development Test',
  scriptText: 'Testing video creation...',
  avatar: 'anna_costume1_cameraA',
  background: 'green_screen'
});
```

### Production Videos

```typescript
// Production videos count against your quota
const productionVideo = await synthesia.videos.createVideo({
  test: false,          // or omit the test parameter
  title: 'Production Video',
  scriptText: 'This is a production-ready video.',
  avatar: 'anna_costume1_cameraA',
  background: 'office',
  visibility: 'public'  // Can be shared publicly
});
```

## Common Pitfalls and Solutions

### 1. Script Too Long
```typescript
// ❌ Problem: Script exceeds time limits
const longScript = "Very long script that exceeds the limits...";

// ✅ Solution: Break into scenes or shorten
const response = await synthesia.videos.createVideo({
  title: 'Multi-Scene Video',
  scenes: [
    {
      avatar: 'anna_costume1_cameraA',
      background: 'office',
      script: 'First part of the content...'
    },
    {
      avatar: 'anna_costume1_cameraA', 
      background: 'office',
      script: 'Second part of the content...'
    }
  ]
});
```

### 2. Invalid Avatar/Background IDs
```typescript
// ❌ Problem: Using invalid IDs
avatar: 'invalid_avatar_id'

// ✅ Solution: Use valid IDs or fetch available options
const templates = await synthesia.templates.listTemplates();
// Check available avatars in template documentation
```

### 3. Forgetting Error Handling
```typescript
// ❌ Problem: Not checking for errors
const response = await synthesia.videos.createVideo({...});
const videoId = response.data.id; // Could be undefined!

// ✅ Solution: Always check response
const response = await synthesia.videos.createVideo({...});
if (response.error) {
  console.error('Error:', response.error.message);
  return;
}
const videoId = response.data!.id; // Safe to use
```

## Next Steps

Now that you've created your first video, explore these advanced features:

- [Working with Templates](/synthesia-sdk/guides/templates/) - Use pre-designed templates
- [Setting Up Webhooks](/synthesia-sdk/guides/webhooks/) - Get notified when videos complete
- [Multi-Scene Videos](/synthesia-sdk/examples/advanced-usage/) - Create complex videos
- [Custom Assets](/synthesia-sdk/guides/custom-assets/) - Upload your own images and audio

## Troubleshooting

### Video Creation Fails
- ✅ Check your API key is valid
- ✅ Ensure you have sufficient credits
- ✅ Verify avatar and background IDs are correct
- ✅ Check script length is reasonable

### Video Gets Stuck in 'in_progress'
- Videos typically take 2-5 minutes to generate
- Test videos are faster than production videos
- Complex videos with multiple scenes take longer
- Contact support if stuck for >10 minutes

### Download URL Not Available
- Only available when status is 'complete'
- URLs expire after some time (download promptly)
- Use webhooks for automatic notifications

## Resources

- [API Reference: Videos](/synthesia-sdk/api-reference/videos/)
- [Official Synthesia Documentation](https://docs.synthesia.io/reference)
- [Avatar Gallery](/synthesia-sdk/resources/avatars/)
- [Background Options](/synthesia-sdk/resources/backgrounds/)