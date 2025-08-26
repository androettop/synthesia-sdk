---
title: Installation & Setup
description: Learn how to install and set up the Synthesia SDK in your project.
sidebar:
  order: 1
---

Learn how to install and set up the Synthesia SDK in your project.

## Prerequisites

- Node.js 16 or higher
- TypeScript 4.5 or higher (recommended)
- A Synthesia account with API access ([Creator plan or above](https://docs.synthesia.io/reference))

## Installation

### Using npm

```bash
npm install @androettop/synthesia-sdk
```

### Using yarn

```bash
yarn add @androettop/synthesia-sdk
```

### Using pnpm

```bash
pnpm add @androettop/synthesia-sdk
```

## Basic Setup

### TypeScript

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: 'your-api-key-here',
});
```

### JavaScript (CommonJS)

```javascript
const { Synthesia } = require('@androettop/synthesia-sdk');

const synthesia = new Synthesia({
  apiKey: 'your-api-key-here',
});
```

### JavaScript (ES Modules)

```javascript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: 'your-api-key-here',
});
```

## Configuration Options

The SDK accepts the following configuration options:

```typescript
const synthesia = new Synthesia({
  apiKey: 'your-api-key-here',        // Required: Your Synthesia API key
  baseURL: 'https://api.synthesia.io/v2', // Optional: Custom API base URL
});
```

### Configuration Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `apiKey` | `string` | ✅ | - | Your Synthesia API key |
| `baseURL` | `string` | ❌ | `https://api.synthesia.io/v2` | Custom API base URL |

## Environment Variables

For security, it's recommended to store your API key in environment variables:

```bash
# .env file
SYNTHESIA_API_KEY=your-api-key-here
```

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY!,
});
```

## Getting Your API Key

1. Log into your [Synthesia account](https://app.synthesia.io/)
2. Navigate to **Integrations** in the settings
3. Click **"Add"** to generate a new API key
4. Copy the API key and store it securely

> 📝 **Note**: API access is available for Creator plans and above. See the [official documentation](https://docs.synthesia.io/reference/synthesia-api-quickstart) for more details.

## Verification

Test your installation and API key:

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY!,
});

// Test API connection
async function testConnection() {
  try {
    const videos = await synthesia.videos.listVideos({ limit: 1 });
    
    if (videos.error) {
      console.error('API Error:', videos.error.message);
    } else {
      console.log('✅ SDK connected successfully!');
      console.log(`Found ${videos.data?.count} videos in your account`);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
```

## Next Steps

- [📖 Follow the Quickstart Guide](./quickstart.md)
- [🔐 Learn about Authentication](./authentication.md)
- [🎥 Create Your First Video](../guides/first-video.md)

## Official Documentation

- [Synthesia API Quickstart](https://docs.synthesia.io/reference/synthesia-api-quickstart)
- [API Reference](https://docs.synthesia.io/reference)