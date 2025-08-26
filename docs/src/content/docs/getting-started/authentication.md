---
title: Authentication
description: Learn how to authenticate with the Synthesia API using your API key.
sidebar:
  order: 3
---

Learn how to authenticate with the Synthesia API using your API key.

## Overview

The Synthesia SDK requires an API key to authenticate with the Synthesia API. API keys are tied to individual accounts and provide access to create AI-generated videos programmatically.

> 📖 **Official Documentation**: [Synthesia API Authentication](https://docs.synthesia.io/reference/synthesia-api-quickstart#authentication)

## Getting Your API Key

1. **Upgrade your plan**: API access is available for Creator plans and above
2. **Navigate to your account settings** in the Synthesia dashboard
3. **Generate an API key** in the API section
4. **Copy and secure your API key** - treat it like a password

⚠️ **Important**: API keys belong to individual accounts, not workspaces. Keep your API key secure and never commit it to version control.

## SDK Authentication

### Basic Setup

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: 'your-api-key-here',
});
```

### Environment Variables (Recommended)

For security, store your API key in environment variables:

```bash
# .env file
SYNTHESIA_API_KEY=your-api-key-here
```

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});
```

### Configuration Options

The SDK constructor accepts the following options:

```typescript
const synthesia = new Synthesia({
  apiKey: 'your-api-key-here',
  baseURL: 'https://api.synthesia.io', // Optional: custom base URL
  timeout: 30000, // Optional: request timeout in milliseconds
});
```

## Authentication Testing

Test your authentication with a simple API call:

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});

async function testAuth() {
  try {
    const templates = await synthesia.templates.listTemplates();
    console.log('✅ Authentication successful');
    console.log(`Found ${templates.data?.length} templates`);
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
  }
}

testAuth();
```

## Common Authentication Errors

### Invalid API Key
```typescript
// Error response
{
  error: {
    message: "Invalid API key",
    type: "authentication_error"
  }
}
```

**Solution**: Verify your API key is correct and hasn't been revoked.

### Insufficient Permissions
```typescript
// Error response
{
  error: {
    message: "API access requires Creator plan or above",
    type: "permission_error"
  }
}
```

**Solution**: Upgrade your Synthesia plan to Creator or above.

### Rate Limited
```typescript
// Error response
{
  error: {
    message: "Rate limit exceeded",
    type: "rate_limit_error"
  }
}
```

**Solution**: Implement rate limiting in your application. See our [Rate Limiting Guide](/synthesia-sdk/guides/rate-limiting/).

## Security Best Practices

### 1. Environment Variables
Never hardcode API keys in your source code:

```typescript
// ❌ Don't do this
const synthesia = new Synthesia({
  apiKey: 'sk-abc123...',
});

// ✅ Do this instead
const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});
```

### 2. Server-Side Only
API keys should only be used server-side. Never expose them in client-side code:

```typescript
// ✅ Server-side (Node.js, Next.js API routes, etc.)
const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});

// ❌ Never in browser/client-side code
```

### 3. Key Rotation
Regularly rotate your API keys and revoke unused ones from your account settings.

## TypeScript Types

The SDK provides full TypeScript support for authentication configuration:

```typescript
import { Synthesia, SynthesiaConfig } from '@androettop/synthesia-sdk';

const config: SynthesiaConfig = {
  apiKey: process.env.SYNTHESIA_API_KEY!,
  timeout: 30000,
};

const synthesia = new Synthesia(config);
```

## Next Steps

- [Create your first video](/synthesia-sdk/getting-started/quickstart/)
- [Explore API Reference](/synthesia-sdk/api-reference/videos/)
- [Set up error handling](/synthesia-sdk/guides/error-handling/)