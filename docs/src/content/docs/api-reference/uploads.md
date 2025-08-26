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
  filename: string;             // Original filename
  type: 'audio' | 'image' | 'video'; // Asset type
}
```

#### Example

```typescript
import fs from 'fs';

// Upload from file system (Node.js)
const fileBuffer = fs.readFileSync('/path/to/audio.wav');

const response = await synthesia.uploads.uploadAsset({
  file: fileBuffer,
  filename: 'custom-narration.wav',
  type: 'audio'
});

if (response.data) {
  console.log('Asset uploaded:', response.data.id);
  console.log('Asset URL:', response.data.url);
  console.log('File size:', response.data.size, 'bytes');
}
```

---

### uploadScriptAudio()

Convenience method for uploading audio files for script narration.

```typescript
async uploadScriptAudio(audioFile: Buffer | Blob, filename: string): Promise<APIResponse<Asset>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `audioFile` | `Buffer \| Blob` | ✅ | Audio file data |
| `filename` | `string` | ✅ | Original filename |

#### Example

```typescript
import fs from 'fs';

const audioBuffer = fs.readFileSync('./narration.mp3');

const response = await synthesia.uploads.uploadScriptAudio(
  audioBuffer,
  'product-demo-narration.mp3'
);

if (response.data) {
  const assetId = response.data.id;
  
  // Use in video creation
  const videoResponse = await synthesia.videos.createVideo({
    title: 'Product Demo with Custom Audio',
    scenes: [{
      avatar: 'anna_costume1_cameraA',
      background: 'office',
      script: assetId, // Use asset ID instead of text
    }]
  });
}
```

---

### uploadImage()

Convenience method for uploading image files.

```typescript
async uploadImage(imageFile: Buffer | Blob, filename: string): Promise<APIResponse<Asset>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imageFile` | `Buffer \| Blob` | ✅ | Image file data |
| `filename` | `string` | ✅ | Original filename |

#### Example

```typescript
const imageBuffer = fs.readFileSync('./company-logo.png');

const response = await synthesia.uploads.uploadImage(
  imageBuffer,
  'company-logo.png'
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
async uploadVideo(videoFile: Buffer | Blob, filename: string): Promise<APIResponse<Asset>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `videoFile` | `Buffer \| Blob` | ✅ | Video file data |
| `filename` | `string` | ✅ | Original filename |

#### Example

```typescript
const videoBuffer = fs.readFileSync('./background-video.mp4');

const response = await synthesia.uploads.uploadVideo(
  videoBuffer,
  'animated-background.mp4'
);

if (response.data) {
  // Use as background in video scene
  const videoResponse = await synthesia.videos.createVideo({
    title: 'Video with Custom Background',
    scenes: [{
      avatar: 'anna_costume1_cameraA',
      background: response.data.id, // Use uploaded video as background
      script: 'Welcome to our presentation!'
    }]
  });
}
```

---

### getAsset()

Retrieve information about an uploaded asset.

```typescript
async getAsset(assetId: string): Promise<APIResponse<Asset>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `assetId` | `string` | ✅ | The unique asset identifier |

#### Example

```typescript
const response = await synthesia.uploads.getAsset('asset-123');

if (response.data) {
  const asset = response.data;
  console.log('Filename:', asset.filename);
  console.log('Type:', asset.type);
  console.log('Size:', asset.size, 'bytes');
  console.log('URL:', asset.url);
  console.log('Created:', asset.createdAt);
}
```

---

### deleteAsset()

Permanently delete an uploaded asset.

```typescript
async deleteAsset(assetId: string): Promise<APIResponse<void>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `assetId` | `string` | ✅ | The unique asset identifier |

#### Example

```typescript
const response = await synthesia.uploads.deleteAsset('asset-123');

if (!response.error) {
  console.log('Asset deleted successfully');
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
    filename: file.name,
    type: assetType
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
  if (file.type.startsWith('audio/')) {
    return synthesia.uploads.uploadScriptAudio(file, file.name);
  } else if (file.type.startsWith('image/')) {
    return synthesia.uploads.uploadImage(file, file.name);
  } else if (file.type.startsWith('video/')) {
    return synthesia.uploads.uploadVideo(file, file.name);
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
  filename: string;        // Original filename
  type: 'audio' | 'image' | 'video'; // Asset type
  url: string;             // Public URL for the asset
  createdAt: string;       // ISO timestamp
  size: number;           // File size in bytes
}
```

## Supported File Formats

### Audio Files
- **MP3** - Most common, good compression
- **WAV** - Uncompressed, high quality
- **AAC** - Good compression with quality
- **OGG** - Open source alternative

### Image Files
- **JPEG/JPG** - Photos and complex images
- **PNG** - Logos, graphics with transparency
- **GIF** - Simple animations (limited)
- **WebP** - Modern format with excellent compression

### Video Files
- **MP4** - Most widely supported
- **MOV** - QuickTime format
- **AVI** - Older format, larger files
- **WebM** - Web-optimized format

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
    filename: file.name,
    type: assetType
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
    title: 'Video with Custom Narration',
    scenes: [{
      avatar: 'anna_costume1_cameraA',
      background: 'office',
      script: audioResponse.data.id // Use asset ID instead of text
    }]
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
      'company-logo.png'
    ),
    synthesia.uploads.uploadVideo(
      fs.readFileSync(backgroundVideoPath),
      'brand-background.mp4'
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

- [Learn about using assets in videos](../guides/custom-assets.md)
- [Explore template customization](../guides/templates.md)
- [See upload examples](../examples/asset-management.md)