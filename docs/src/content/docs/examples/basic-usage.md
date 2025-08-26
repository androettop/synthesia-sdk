---
title: Basic Usage Examples
description: Simple examples to get you started with the Synthesia SDK quickly.
sidebar:
  order: 1
---

Simple examples to get you started with the Synthesia SDK quickly.

## Installation and Setup

```bash
npm install @androettop/synthesia-sdk
```

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});
```

## Creating Your First Video

### Simple Text-to-Video

```typescript
async function createSimpleVideo() {
  const response = await synthesia.videos.createVideo({
    input: [{
      scriptText: 'Hello! Welcome to my first AI-generated video.',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    }],
    test: true, // Remove for production videos
    title: 'My First Video',
    visibility: 'private',
    aspectRatio: '16:9'
  });

  if (response.data) {
    console.log('✅ Video created:', response.data.id);
    console.log('Status:', response.data.status);
    return response.data.id;
  } else {
    console.error('❌ Failed:', response.error?.message);
  }
}

createSimpleVideo();
```

### Checking Video Status

```typescript
async function checkVideoStatus(videoId: string) {
  const response = await synthesia.videos.getVideo(videoId);
  
  if (response.data) {
    const video = response.data;
    console.log(`Video: ${video.title}`);
    console.log(`Status: ${video.status}`);
    
    if (video.status === 'complete') {
      console.log(`✅ Ready! Download: ${video.download}`);
      console.log(`🖼️ Thumbnail: ${video.thumbnails?.static}`);
    } else if (video.status === 'in_progress') {
      console.log('⏳ Still processing...');
    } else if (video.status === 'failed') {
      console.log('❌ Generation failed');
    }
  }
}
```

### Waiting for Video Completion

```typescript
async function waitForVideo(videoId: string): Promise<any> {
  console.log('⏳ Waiting for video to complete...');
  
  while (true) {
    const response = await synthesia.videos.getVideo(videoId);
    
    if (!response.data) {
      throw new Error('Video not found');
    }
    
    const video = response.data;
    
    switch (video.status) {
      case 'complete':
        console.log('✅ Video completed!');
        return video;
        
      case 'failed':
        throw new Error('Video generation failed');
        
      case 'in_progress':
        console.log('Still processing... ⏳');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
        break;
    }
  }
}

// Usage
const videoId = await createSimpleVideo();
if (videoId) {
  const completedVideo = await waitForVideo(videoId);
  console.log('Download URL:', completedVideo.download);
}
```

## Working with Different Avatars and Backgrounds

### Popular Avatar Examples

```typescript
const avatars = {
  professional: {
    anna: 'anna_costume1_cameraA',
    james: 'james_costume1_cameraA',
    sophia: 'sophia_costume1_cameraA'
  },
  casual: {
    anna: 'anna_costume2_cameraA',
    james: 'james_costume2_cameraA',
    david: 'david_costume2_cameraA'
  }
};

async function createWithDifferentAvatars() {
  // Professional woman
  const video1 = await synthesia.videos.createVideo({
    input: [{
      scriptText: 'Welcome to our quarterly business review.',
      avatar: avatars.professional.anna,
      background: 'office'
    }],
    title: 'Professional Presentation',
    visibility: 'private',
    aspectRatio: '16:9',
    test: true
  });

  // Casual man
  const video2 = await synthesia.videos.createVideo({
    input: [{
      scriptText: 'Hey there! Let me show you how this works.',
      avatar: avatars.casual.james,
      background: 'white_studio'
    }],
    title: 'Casual Tutorial',
    visibility: 'private',
    aspectRatio: '16:9',
    test: true
  });

  return { video1: video1.data, video2: video2.data };
}
```

### Background Variations

```typescript
const backgrounds = {
  studio: 'white_studio',
  office: 'office',
  modern: 'modern_office',
  library: 'library',
  greenScreen: 'green_screen'
};

async function createWithDifferentBackgrounds() {
  const script = 'This video demonstrates different background options.';
  
  const videos = await Promise.all([
    synthesia.videos.createVideo({
      input: [{
        scriptText: script,
        avatar: 'anna_costume1_cameraA',
        background: backgrounds.studio
      }],
      title: 'Studio Background',
      visibility: 'private',
      aspectRatio: '16:9',
      test: true
    }),
    
    synthesia.videos.createVideo({
      input: [{
        scriptText: script,
        avatar: 'anna_costume1_cameraA',
        background: backgrounds.office
      }],
      title: 'Office Background',
      visibility: 'private',
      aspectRatio: '16:9',
      test: true
    }),
    
    synthesia.videos.createVideo({
      input: [{
        scriptText: script,
        avatar: 'anna_costume1_cameraA',
        background: backgrounds.library
      }],
      title: 'Library Background',
      visibility: 'private',
      aspectRatio: '16:9',
      test: true
    })
  ]);

  return videos.map(v => v.data).filter(Boolean);
}
```

## Multi-Scene Videos

### Basic Multi-Scene Example

```typescript
async function createMultiSceneVideo() {
  const response = await synthesia.videos.createVideo({
    input: [
      {
        scriptText: 'Welcome to our presentation. Let me introduce the topics we will cover today.',
        avatar: 'anna_costume1_cameraA',
        background: 'office'
      },
      {
        scriptText: 'First, we will discuss the current market situation and our analysis.',
        avatar: 'james_costume1_cameraA',
        background: 'white_studio'
      },
      {
        scriptText: 'Next, I will present our strategy and recommendations for moving forward.',
        avatar: 'anna_costume1_cameraA',
        background: 'office'
      },
      {
        scriptText: 'Finally, we will review the timeline and next steps for implementation.',
        avatar: 'james_costume1_cameraA',
        background: 'modern_office'
      }
    ],
    title: 'Multi-Scene Presentation',
    visibility: 'private',
    aspectRatio: '16:9',
    test: true
  });

  return response.data;
}
```

### Multi-Scene with Voice Settings

```typescript
async function createWithVoiceSettings() {
  const response = await synthesia.videos.createVideo({
    input: [
      {
        scriptText: 'This is the normal speaking pace and tone.',
        avatar: 'anna_costume1_cameraA',
        background: 'office',
        avatarSettings: {
          voice: 'anna_costume1_cameraA'
        }
      },
      {
        scriptText: 'Now I am speaking more slowly and with a slightly lower pitch.',
        avatar: 'anna_costume1_cameraA',
        background: 'office',
        avatarSettings: {
          voice: 'anna_costume1_cameraA'
        }
      },
      {
        scriptText: 'And here I am speaking faster with a higher pitch for emphasis!',
        avatar: 'anna_costume1_cameraA',
        background: 'office',
        avatarSettings: {
          voice: 'anna_costume1_cameraA'
        }
      }
    ],
    title: 'Voice Settings Demo',
    visibility: 'private',
    aspectRatio: '16:9',
    test: true
  });

  return response.data;
}
```

## Video Management

### Listing Videos

```typescript
async function listMyVideos() {
  // Get all videos
  const allVideos = await synthesia.videos.listVideos();
  
  if (allVideos.data) {
    console.log(`Total videos: ${allVideos.data.count}`);
    
    allVideos.data.videos.forEach(video => {
      console.log(`- ${video.title} (${video.status}) - ${video.createdAt}`);
    });
  }

  // Get only workspace videos with pagination
  const workspaceVideos = await synthesia.videos.listVideos({
    source: 'workspace',
    limit: 10,
    offset: 0
  });

  return { all: allVideos.data, workspace: workspaceVideos.data };
}
```

### Updating Videos

```typescript
async function updateVideoDetails(videoId: string) {
  const response = await synthesia.videos.updateVideo(videoId, {
    title: 'Updated Video Title',
    visibility: 'public' // Make video public
  });

  if (response.data) {
    console.log('✅ Video updated successfully');
    console.log('New title:', response.data.title);
    console.log('Visibility:', response.data.visibility);
  }

  return response.data;
}
```

### Deleting Videos

```typescript
async function deleteVideo(videoId: string) {
  const response = await synthesia.videos.deleteVideo(videoId);

  if (!response.error) {
    console.log('✅ Video deleted successfully');
    return true;
  } else {
    console.error('❌ Failed to delete video:', response.error.message);
    return false;
  }
}

// Delete multiple videos
async function deleteMultipleVideos(videoIds: string[]) {
  const results = await Promise.allSettled(
    videoIds.map(id => synthesia.videos.deleteVideo(id))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  console.log(`Deleted ${successful}/${videoIds.length} videos`);

  return successful;
}
```

## Working with Templates

### Finding Templates

```typescript
async function exploreTemplates() {
  // Get all available templates
  const allTemplates = await synthesia.templates.listTemplates();
  
  if (allTemplates.data) {
    console.log(`Found ${allTemplates.data.count} templates`);
    
    // Find marketing templates
    const marketingTemplates = allTemplates.data.templates.filter(template =>
      template.name.toLowerCase().includes('marketing') ||
      template.description?.toLowerCase().includes('marketing')
    );
    
    console.log(`Marketing templates: ${marketingTemplates.length}`);
    
    // Show template details
    marketingTemplates.forEach(template => {
      console.log(`\n📋 ${template.name}`);
      console.log(`Description: ${template.description || 'N/A'}`);
      console.log(`Variables: ${template.variables.length}`);
      
      template.variables.forEach(variable => {
        const required = variable.required ? '(required)' : '(optional)';
        console.log(`  - ${variable.name} (${variable.type}) ${required}`);
      });
    });
  }

  return allTemplates.data;
}
```

### Using Templates

```typescript
async function createFromTemplate() {
  // First, get template details
  const templateResponse = await synthesia.templates.getTemplate('welcome-template');
  
  if (!templateResponse.data) {
    console.error('Template not found');
    return;
  }

  const template = templateResponse.data;
  console.log(`Using template: ${template.name}`);
  
  // Prepare template data
  const templateData = {
    customer_name: 'John Smith',
    company_name: 'Acme Corporation',
    welcome_message: 'Welcome to our premium service! We are excited to have you on board.',
    avatar: 'anna_costume1_cameraA'
  };

  // Create video from template
  const videoResponse = await synthesia.videos.createVideoFromTemplate(
    template.id,
    templateData,
    {
      title: `Welcome Video - ${templateData.customer_name}`,
      test: true,
      visibility: 'private'
    }
  );

  if (videoResponse.data) {
    console.log('✅ Template video created:', videoResponse.data.id);
    return videoResponse.data;
  }
}
```

## Error Handling Examples

### Basic Error Handling

```typescript
async function createVideoSafely() {
  try {
    const response = await synthesia.videos.createVideo({
      input: [{
        scriptText: 'This demonstrates error handling.',
        avatar: 'anna_costume1_cameraA',
        background: 'office'
      }],
      title: 'Safe Video Creation',
      visibility: 'private',
      aspectRatio: '16:9',
      test: true
    });

    // Check for API errors
    if (response.error) {
      console.error('API Error:', response.error.message);
      console.error('Status Code:', response.error.statusCode);
      
      // Handle specific error types
      switch (response.error.statusCode) {
        case 400:
          console.error('❌ Invalid request - check your parameters');
          break;
        case 401:
          console.error('❌ Authentication failed - check your API key'); 
          break;
        case 429:
          console.error('❌ Rate limited - please slow down');
          break;
        case 500:
          console.error('❌ Server error - try again later');
          break;
      }
      
      return null;
    }

    console.log('✅ Video created successfully:', response.data.id);
    return response.data;

  } catch (error) {
    console.error('Network Error:', error.message);
    return null;
  }
}
```

### Retry Logic

```typescript
async function createVideoWithRetry(params: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}`);
      
      const response = await synthesia.videos.createVideo(params);
      
      if (response.error) {
        // Don't retry client errors (4xx)
        if (response.error.statusCode >= 400 && response.error.statusCode < 500) {
          throw new Error(response.error.message);
        }
        
        // Retry server errors (5xx)
        if (response.error.statusCode >= 500 && attempt < maxRetries) {
          console.log(`Server error, retrying in ${attempt * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        
        throw new Error(response.error.message);
      }
      
      console.log('✅ Success on attempt', attempt);
      return response.data;

    } catch (error) {
      if (attempt === maxRetries) {
        console.error('❌ All attempts failed:', error.message);
        throw error;
      }
      
      console.log(`Attempt ${attempt} failed:`, error.message);
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
}
```

## Complete Example: End-to-End Video Creation

```typescript
async function completeVideoWorkflow() {
  console.log('🎬 Starting complete video workflow...');
  
  try {
    // Step 1: Create video
    console.log('1️⃣ Creating video...');
    const createResponse = await synthesia.videos.createVideo({
      input: [{
        scriptText: `
          Hello and welcome to this complete workflow demonstration.
          This video shows how to create, monitor, and manage videos using the Synthesia SDK.
          Thank you for watching!
        `,
        avatar: 'anna_costume1_cameraA',
        background: 'office'
      }],
      title: 'Complete Workflow Demo',
      visibility: 'private',
      aspectRatio: '16:9',
      test: true
    });

    if (!createResponse.data) {
      throw new Error(createResponse.error?.message || 'Failed to create video');
    }

    const videoId = createResponse.data.id;
    console.log(`✅ Video created: ${videoId}`);

    // Step 2: Wait for completion
    console.log('2️⃣ Waiting for video completion...');
    let video = createResponse.data;
    
    while (video.status === 'in_progress') {
      console.log('⏳ Still processing...');
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      
      const statusResponse = await synthesia.videos.getVideo(videoId);
      if (!statusResponse.data) {
        throw new Error('Failed to get video status');
      }
      
      video = statusResponse.data;
    }

    if (video.status === 'failed') {
      throw new Error('Video generation failed');
    }

    console.log('✅ Video completed successfully!');

    // Step 3: Get final details
    console.log('3️⃣ Getting final video details...');
    console.log(`📹 Title: ${video.title}`);
    console.log(`⏱️ Duration: ${video.duration} seconds`);
    console.log(`📥 Download: ${video.download}`);
    console.log(`🖼️ Thumbnail: ${video.thumbnails?.static}`);
    console.log(`📝 Captions: ${video.captions?.srt}`);

    // Step 4: Update video details
    console.log('4️⃣ Updating video metadata...');
    const updateResponse = await synthesia.videos.updateVideo(videoId, {
      title: 'Complete Workflow Demo - COMPLETED',
      visibility: 'public'
    });

    if (updateResponse.data) {
      console.log('✅ Video metadata updated');
    }

    return {
      success: true,
      videoId,
      downloadUrl: video.download,
      duration: video.duration
    };

  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the complete workflow
completeVideoWorkflow().then(result => {
  if (result.success) {
    console.log('🎉 Workflow completed successfully!');
    console.log('Video ID:', result.videoId);
    console.log('Download URL:', result.downloadUrl);
  } else {
    console.log('😞 Workflow failed:', result.error);
  }
});
```

## Environment Configuration

### Development Setup

```typescript
// config/development.ts
export const developmentConfig = {
  synthesia: {
    apiKey: process.env.SYNTHESIA_API_KEY,
    defaultSettings: {
      test: true, // Always use test mode in development
      visibility: 'private',
      avatar: 'anna_costume1_cameraA',
      background: 'white_studio'
    }
  }
};

// Usage in development
const synthesia = new Synthesia({
  apiKey: developmentConfig.synthesia.apiKey,
});

async function createDevVideo(title: string, script: string) {
  return synthesia.videos.createVideo({
    input: [{
      scriptText: script,
      avatar: developmentConfig.synthesia.defaultSettings.avatar,
      background: developmentConfig.synthesia.defaultSettings.background
    }],
    title,
    visibility: developmentConfig.synthesia.defaultSettings.visibility,
    aspectRatio: '16:9',
    test: developmentConfig.synthesia.defaultSettings.test
  });
}
```

### Production Setup

```typescript
// config/production.ts
export const productionConfig = {
  synthesia: {
    apiKey: process.env.SYNTHESIA_API_KEY,
    defaultSettings: {
      test: false, // Production videos
      visibility: 'private', // Default to private
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    },
    rateLimiting: {
      requestsPerMinute: 50, // Leave headroom
      retryAttempts: 3
    }
  }
};
```

## Next Steps

- [Read the API reference](/synthesia-sdk/api-reference/videos/)