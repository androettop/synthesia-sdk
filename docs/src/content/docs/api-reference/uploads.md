---
title: Uploads API
description: Upload and manage custom assets (audio, images, videos) for your videos.
sidebar:
  order: 4
---

The Uploads API allows you to upload and manage custom assets (audio, images, videos) for use in your Synthesia videos.

> 📖 **Official API Documentation**: [Synthesia Upload API](https://docs.synthesia.io/reference/upload-script-audio)

## Overview

Upload custom assets to enhance your videos with:
- Custom audio files for script narration
- Background images and logos
- Video clips for scene backgrounds
- Brand assets for consistent styling

All uploaded assets are stored securely and can be referenced by ID in video creation requests.

## Methods

### uploadAsset()

Upload a custom asset file.

```typescript
async uploadAsset(request: UploadAssetRequest): Promise<APIResponse<Asset>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | `UploadAssetRequest` | ✅ | Upload configuration |

#### UploadAssetRequest Interface

```typescript
interface UploadAssetRequest {
  file: Buffer | Blob;          // File data
  contentType: string;          // MIME type (e.g., 'image/jpeg', 'audio/mpeg')
}
```

#### Example

```typescript
import fs from 'fs';

// Upload from file system (Node.js)
const fileBuffer = fs.readFileSync('/path/to/audio.wav');

const response = await synthesia.uploads.uploadAsset({
  file: fileBuffer,
  contentType: 'audio/wav'
});

if (response.data) {
  console.log('Asset uploaded:', response.data.id);
  console.log('Asset title:', response.data.title);
}
```

---

### uploadScriptAudio()

Convenience method for uploading audio files for script narration.

```typescript
async uploadScriptAudio(audioFile: Buffer | Blob): Promise<APIResponse<ScriptAudioAsset>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `audioFile` | `Buffer \| Blob` | ✅ | Audio file data (MP3 format) |

#### Example

```typescript
import fs from 'fs';

const audioBuffer = fs.readFileSync('./narration.mp3');

const response = await synthesia.uploads.uploadScriptAudio(audioBuffer);

if (response.data) {
  const assetId = response.data.id;
  
  // Use in video creation
  const videoResponse = await synthesia.videos.createVideo({
    input: [{
      scriptAudio: assetId, // Use asset ID for custom audio
      scriptLanguage: 'en-US',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    }],
    title: 'Product Demo with Custom Audio',
    visibility: 'private',
    aspectRatio: '16:9'
  });
}
```

---

### uploadImage()

Convenience method for uploading image files.

```typescript
async uploadImage(imageFile: Buffer | Blob, contentType: string): Promise<APIResponse<Asset>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imageFile` | `Buffer \| Blob` | ✅ | Image file data |
| `contentType` | `string` | ✅ | MIME type (e.g., 'image/jpeg', 'image/png') |

#### Example

```typescript
const imageBuffer = fs.readFileSync('./company-logo.png');

const response = await synthesia.uploads.uploadImage(
  imageBuffer,
  'image/png'
);

if (response.data) {
  // Use in template data
  const videoResponse = await synthesia.videos.createVideoFromTemplate(
    'branded-template',
    {
      company_logo: response.data.id,
      title: 'Welcome to Our Company'
    }
  );
}
```

---

### uploadVideo()

Convenience method for uploading video files.

```typescript
async uploadVideo(videoFile: Buffer | Blob, contentType: string): Promise<APIResponse<Asset>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `videoFile` | `Buffer \| Blob` | ✅ | Video file data |
| `contentType` | `string` | ✅ | MIME type (e.g., 'video/mp4', 'video/webm') |

#### Example

```typescript
const videoBuffer = fs.readFileSync('./background-video.mp4');

const response = await synthesia.uploads.uploadVideo(
  videoBuffer,
  'video/mp4'
);

if (response.data) {
  // Use as background in video scene
  const videoResponse = await synthesia.videos.createVideo({
    input: [{
      scriptText: 'Welcome to our presentation!',
      avatar: 'anna_costume1_cameraA',
      background: response.data.id // Use uploaded video as background
    }],
    title: 'Video with Custom Background',
    visibility: 'private',
    aspectRatio: '16:9'
  });
}
```


## File Upload Examples

### Browser File Upload

```typescript
// HTML: <input type="file" id="fileInput" accept="audio/*,image/*,video/*">

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;
  
  // Determine asset type based on file
  let assetType: 'audio' | 'image' | 'video';
  
  if (file.type.startsWith('audio/')) {
    assetType = 'audio';
  } else if (file.type.startsWith('image/')) {
    assetType = 'image';
  } else if (file.type.startsWith('video/')) {
    assetType = 'video';
  } else {
    throw new Error('Unsupported file type');
  }
  
  const response = await synthesia.uploads.uploadAsset({
    file: file,
    contentType: file.type
  });
  
  if (response.data) {
    console.log('Upload successful:', response.data.id);
  }
}

document.getElementById('fileInput')?.addEventListener('change', handleFileUpload);
```

### Drag and Drop Upload

```typescript
function setupDragAndDrop(dropZone: HTMLElement) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });
  
  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer?.files || []);
    
    for (const file of files) {
      try {
        const response = await uploadFileBasedOnType(file);
        console.log('Uploaded:', response.data?.id);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  });
}

async function uploadFileBasedOnType(file: File) {
  if (file.type === 'audio/mpeg') {
    return synthesia.uploads.uploadScriptAudio(file);
  } else if (file.type.startsWith('image/')) {
    return synthesia.uploads.uploadImage(file, file.type);
  } else if (file.type.startsWith('video/')) {
    return synthesia.uploads.uploadVideo(file, file.type);
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
}
```

### Progress Tracking

```typescript
async function uploadWithProgress(file: File, onProgress: (progress: number) => void) {
  return new Promise<APIResponse<Asset>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({ data: response });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', getAssetType(file));
    
    // Start upload
    xhr.open('POST', 'https://api.synthesia.io/v2/uploads/assets');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.send(formData);
  });
}

function getAssetType(file: File): 'audio' | 'image' | 'video' {
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  throw new Error('Unsupported file type');
}

// Usage
uploadWithProgress(file, (progress) => {
  console.log(`Upload progress: ${progress.toFixed(1)}%`);
}).then(response => {
  console.log('Upload complete:', response.data?.id);
});
```

## TypeScript Interfaces

### Asset

```typescript
interface Asset {
  id: string;              // Unique asset identifier
  title?: string;          // Asset title/filename
}

interface ScriptAudioAsset {
  id: string;              // Unique asset identifier for script audio
}
```

## Supported File Formats

### Audio Files (Script Audio)
- **MP3** - Required format for script audio uploads (audio/mpeg)

### Image Files
- **JPEG/JPG** - Photos and complex images (image/jpeg)
- **PNG** - Logos, graphics with transparency (image/png)
- **SVG** - Vector graphics (image/svg+xml)

### Video Files
- **MP4** - Most widely supported (video/mp4)
- **WebM** - Web-optimized format (video/webm)

## File Size Limits

| Asset Type | Maximum Size | Recommended Size |
|------------|--------------|------------------|
| Audio | 100 MB | < 50 MB |
| Image | 50 MB | < 10 MB |
| Video | 500 MB | < 200 MB |

## Best Practices

### 1. Optimize Files Before Upload

```typescript
async function optimizeAndUpload(file: File): Promise<APIResponse<Asset>> {
  // Check file size
  const maxSizes = {
    audio: 100 * 1024 * 1024, // 100MB
    image: 50 * 1024 * 1024,  // 50MB
    video: 500 * 1024 * 1024  // 500MB
  };
  
  const assetType = getAssetType(file);
  
  if (file.size > maxSizes[assetType]) {
    throw new Error(`File too large. Maximum size for ${assetType}: ${maxSizes[assetType] / (1024 * 1024)}MB`);
  }
  
  // Upload the file
  return synthesia.uploads.uploadAsset({
    file: file,
    contentType: file.type
  });
}
```

### 2. Asset Management

```typescript
class AssetManager {
  private uploadedAssets: Map<string, Asset> = new Map();
  
  async uploadAndCache(file: File): Promise<string> {
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
    
    // Check cache first
    if (this.uploadedAssets.has(cacheKey)) {
      return this.uploadedAssets.get(cacheKey)!.id;
    }
    
    // Upload new asset
    const response = await uploadFileBasedOnType(file);
    
    if (response.data) {
      this.uploadedAssets.set(cacheKey, response.data);
      return response.data.id;
    }
    
    throw new Error('Upload failed');
  }
  
  async cleanupUnusedAssets(usedAssetIds: string[]) {
    for (const [key, asset] of this.uploadedAssets) {
      if (!usedAssetIds.includes(asset.id)) {
        await synthesia.uploads.deleteAsset(asset.id);
        this.uploadedAssets.delete(key);
        console.log(`Cleaned up unused asset: ${asset.filename}`);
      }
    }
  }
}
```

### 3. Batch Upload

```typescript
async function batchUpload(files: File[]): Promise<Asset[]> {
  const uploadPromises = files.map(file => uploadFileBasedOnType(file));
  
  const results = await Promise.allSettled(uploadPromises);
  
  const successfulUploads: Asset[] = [];
  const failedUploads: string[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.data) {
      successfulUploads.push(result.value.data);
    } else {
      failedUploads.push(files[index].name);
    }
  });
  
  if (failedUploads.length > 0) {
    console.warn('Failed uploads:', failedUploads);
  }
  
  console.log(`Successfully uploaded ${successfulUploads.length}/${files.length} files`);
  return successfulUploads;
}
```

## Integration Examples

### Custom Audio Narration

```typescript
async function createVideoWithCustomAudio(scriptAudioPath: string) {
  // Upload custom audio
  const audioBuffer = fs.readFileSync(scriptAudioPath);
  const audioResponse = await synthesia.uploads.uploadScriptAudio(
    audioBuffer,
    'custom-narration.mp3'
  );
  
  if (!audioResponse.data) {
    throw new Error('Audio upload failed');
  }
  
  // Create video using uploaded audio
  const videoResponse = await synthesia.videos.createVideo({
    input: [{
      scriptAudio: audioResponse.data.id, // Use asset ID for custom audio
      scriptLanguage: 'en-US',
      avatar: 'anna_costume1_cameraA',
      background: 'office'
    }],
    title: 'Video with Custom Narration',
    visibility: 'private',
    aspectRatio: '16:9'
  });
  
  return videoResponse.data?.id;
}
```

### Branded Video Creation

```typescript
async function createBrandedVideo(logoPath: string, backgroundVideoPath: string) {
  // Upload brand assets
  const [logoResponse, backgroundResponse] = await Promise.all([
    synthesia.uploads.uploadImage(
      fs.readFileSync(logoPath),
      'image/png'
    ),
    synthesia.uploads.uploadVideo(
      fs.readFileSync(backgroundVideoPath),
      'video/mp4'
    )
  ]);
  
  if (!logoResponse.data || !backgroundResponse.data) {
    throw new Error('Asset upload failed');
  }
  
  // Create video using template with uploaded assets
  return synthesia.videos.createVideoFromTemplate(
    'branded-template',
    {
      company_logo: logoResponse.data.id,
      background_video: backgroundResponse.data.id,
      company_name: 'Acme Corporation',
      message: 'Welcome to our service!'
    }
  );
}
```

## Error Handling

```typescript
try {
  const response = await synthesia.uploads.uploadImage(imageBuffer, 'logo.png');
  
  if (response.error) {
    switch (response.error.statusCode) {
      case 413:
        console.error('File too large');
        break;
      case 415:
        console.error('Unsupported file type');
        break;
      case 429:
        console.error('Rate limit exceeded');
        break;
      default:
        console.error('Upload failed:', response.error.message);
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Next Steps

- [Explore template customization](/synthesia-sdk/guides/templates/)
