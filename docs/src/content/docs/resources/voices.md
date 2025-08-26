---
title: Supported Voices
description: Complete reference for voice settings and customization options.
sidebar:
  order: 2
---

Complete reference for voice settings and customization options in Synthesia videos.

> 📖 **Official Documentation**: [Synthesia Supported Voices](https://docs.synthesia.io/reference/supported-voices)

## Voice Settings Overview

Each avatar in Synthesia comes with a natural voice that can be customized using voice settings to match your content needs.

### Available Parameters

```typescript
interface VoiceSettings {
  speed?: number;  // Voice speed (0.5 - 2.0)
  pitch?: number;  // Voice pitch (0.5 - 2.0)
}
```

## Speed Settings

Control how fast or slow the avatar speaks.

### Speed Range and Effects

| Speed | Effect | Best For |
|-------|--------|----------|
| 0.5 | Very slow, deliberate | Complex explanations, elderly audience |
| 0.7 | Slow, clear | Educational content, non-native speakers |
| 0.9 | Slightly slow | Professional presentations |
| 1.0 | Natural pace | Default, most content |
| 1.1 | Slightly fast | Engaging content |
| 1.3 | Fast, energetic | Marketing, youth content |
| 1.5 | Very fast | Quick updates, summaries |
| 2.0 | Maximum speed | Time-compressed content |

### Speed Examples

```typescript
// Very slow for complex topics
const slowVoice = {
  speed: 0.7,
  pitch: 1.0
};

// Natural conversational speed
const naturalVoice = {
  speed: 1.0,
  pitch: 1.0
};

// Energetic for marketing
const energeticVoice = {
  speed: 1.2,
  pitch: 1.05
};

// Fast-paced for summaries
const fastVoice = {
  speed: 1.5,
  pitch: 1.0
};

async function createWithSpeedVariations() {
  const speeds = [0.8, 1.0, 1.2, 1.4];
  
  const videos = await Promise.all(
    speeds.map((speed, index) =>
      synthesia.videos.createVideo({
        title: `Speed Test ${speed}x`,
        scenes: [{
          avatar: 'anna_costume1_cameraA',
          background: 'office',
          script: 'This is a test of different speaking speeds. Notice how the pace affects the message delivery.',
          voiceSettings: { speed, pitch: 1.0 }
        }],
        test: true
      })
    )
  );
  
  return videos.map(v => v.data).filter(Boolean);
}
```

## Pitch Settings

Adjust the voice pitch to convey different emotions and tones.

### Pitch Range and Effects

| Pitch | Effect | Emotional Tone | Best For |
|-------|--------|----------------|----------|
| 0.5 | Very low | Serious, authoritative | Executive announcements |
| 0.7 | Low | Professional, calm | Business presentations |
| 0.9 | Slightly low | Mature, trustworthy | Expert content |
| 1.0 | Natural | Neutral, balanced | Default content |
| 1.05 | Slightly high | Friendly, approachable | Customer service |
| 1.1 | High | Enthusiastic, engaging | Marketing content |
| 1.3 | Very high | Excited, youthful | Product launches |
| 2.0 | Maximum pitch | Extremely excited | Special announcements |

### Pitch Examples

```typescript
// Authoritative, low pitch
const authoritativeVoice = {
  speed: 0.95,
  pitch: 0.8
};

// Friendly, higher pitch
const friendlyVoice = {
  speed: 1.0,
  pitch: 1.1
};

// Enthusiastic, high energy
const enthusiasticVoice = {
  speed: 1.2,
  pitch: 1.2
};

async function createWithPitchVariations() {
  const script = 'Welcome to our platform! We are excited to help you succeed.';
  
  const pitchVariations = [
    { name: 'Professional', pitch: 0.9, speed: 1.0 },
    { name: 'Friendly', pitch: 1.1, speed: 1.0 },
    { name: 'Enthusiastic', pitch: 1.2, speed: 1.1 },
    { name: 'Authoritative', pitch: 0.8, speed: 0.95 }
  ];
  
  const videos = await Promise.all(
    pitchVariations.map(variation =>
      synthesia.videos.createVideo({
        title: `Pitch Test - ${variation.name}`,
        scenes: [{
          avatar: 'anna_costume1_cameraA',
          background: 'office',
          script: script,
          voiceSettings: {
            speed: variation.speed,
            pitch: variation.pitch
          }
        }],
        test: true
      })
    )
  );
  
  return videos.map(v => v.data).filter(Boolean);
}
```

## Voice Combinations by Use Case

### Business Communications

```typescript
const businessVoiceSettings = {
  // Executive presentation
  executive: {
    speed: 0.95,
    pitch: 0.9 // Slower, authoritative
  },
  
  // Professional presentation
  professional: {
    speed: 1.0,
    pitch: 1.0 // Natural, clear
  },
  
  // Team update
  teamUpdate: {
    speed: 1.05,
    pitch: 1.0 // Slightly faster, engaging
  },
  
  // Customer announcement
  customerAnnouncement: {
    speed: 1.0,
    pitch: 1.05 // Warm, approachable
  }
};

async function createBusinessVideo(type: keyof typeof businessVoiceSettings) {
  const voiceSettings = businessVoiceSettings[type];
  
  const response = await synthesia.videos.createVideo({
    title: `Business Video - ${type}`,
    scenes: [{
      avatar: 'james_costume1_cameraA',
      background: 'office',
      script: 'This is a business communication with optimized voice settings.',
      voiceSettings
    }],
    test: true
  });
  
  return response.data;
}
```

### Educational Content

```typescript
const educationalVoiceSettings = {
  // Complex explanation
  complex: {
    speed: 0.8,
    pitch: 1.0 // Slower for comprehension
  },
  
  // Tutorial
  tutorial: {
    speed: 0.9,
    pitch: 1.05 // Clear and friendly
  },
  
  // Quick tip
  quickTip: {
    speed: 1.1,
    pitch: 1.1 // Faster, energetic
  },
  
  // Children's content
  children: {
    speed: 0.9,
    pitch: 1.2 // Slower, higher pitch
  }
};
```

### Marketing Content

```typescript
const marketingVoiceSettings = {
  // Product launch
  productLaunch: {
    speed: 1.2,
    pitch: 1.15 // Fast, exciting
  },
  
  // Brand story
  brandStory: {
    speed: 1.0,
    pitch: 1.05 // Natural, warm
  },
  
  // Call to action
  callToAction: {
    speed: 1.3,
    pitch: 1.1 // Urgent, compelling
  },
  
  // Testimonial
  testimonial: {
    speed: 1.0,
    pitch: 1.0 // Authentic, natural
  }
};
```

## Avatar-Specific Voice Optimization

### Recommended Settings by Avatar

```typescript
const avatarVoiceOptimization = {
  // Professional female avatars
  'anna_costume1_cameraA': {
    business: { speed: 1.0, pitch: 1.0 },
    friendly: { speed: 1.05, pitch: 1.1 },
    authoritative: { speed: 0.95, pitch: 0.95 }
  },
  
  // Professional male avatars
  'james_costume1_cameraA': {
    business: { speed: 0.95, pitch: 0.9 },
    friendly: { speed: 1.0, pitch: 1.0 },
    authoritative: { speed: 0.9, pitch: 0.85 }
  },
  
  // Casual female avatars
  'sophia_costume2_cameraA': {
    tutorial: { speed: 1.0, pitch: 1.1 },
    energetic: { speed: 1.2, pitch: 1.2 },
    explanatory: { speed: 0.9, pitch: 1.05 }
  },
  
  // Technical avatars
  'alex_costume1_cameraA': {
    technical: { speed: 0.95, pitch: 1.0 },
    presentation: { speed: 1.0, pitch: 0.95 },
    training: { speed: 0.9, pitch: 1.0 }
  }
};

function getOptimalVoiceSettings(avatar: string, contentType: string) {
  const avatarSettings = avatarVoiceOptimization[avatar];
  if (avatarSettings && avatarSettings[contentType]) {
    return avatarSettings[contentType];
  }
  
  // Default fallback
  return { speed: 1.0, pitch: 1.0 };
}
```

## Advanced Voice Techniques

### Emotional Emphasis

```typescript
async function createEmotionalContent() {
  const scenarios = [
    {
      emotion: 'excitement',
      script: 'We are thrilled to announce our new product launch!',
      voice: { speed: 1.3, pitch: 1.2 }
    },
    {
      emotion: 'concern',
      script: 'We need to address this issue immediately.',
      voice: { speed: 0.9, pitch: 0.9 }
    },
    {
      emotion: 'confidence',
      script: 'Our solution will deliver exceptional results.',
      voice: { speed: 1.0, pitch: 0.95 }
    },
    {
      emotion: 'warmth',
      script: 'Thank you for being part of our community.',
      voice: { speed: 1.05, pitch: 1.1 }
    }
  ];
  
  const videos = await Promise.all(
    scenarios.map(scenario =>
      synthesia.videos.createVideo({
        title: `Emotional Voice - ${scenario.emotion}`,
        scenes: [{
          avatar: 'anna_costume1_cameraA',
          background: 'office',
          script: scenario.script,
          voiceSettings: scenario.voice
        }],
        test: true
      })
    )
  );
  
  return videos.map(v => v.data).filter(Boolean);
}
```

### Progressive Voice Changes

```typescript
async function createProgressiveVoiceVideo() {
  const response = await synthesia.videos.createVideo({
    title: 'Progressive Voice Changes',
    scenes: [
      {
        avatar: 'anna_costume1_cameraA',
        background: 'office',
        script: 'Let me start with a calm, professional introduction.',
        voiceSettings: { speed: 0.95, pitch: 1.0 }
      },
      {
        avatar: 'anna_costume1_cameraA',
        background: 'office',
        script: 'Now I will speak with more energy and enthusiasm!',
        voiceSettings: { speed: 1.1, pitch: 1.1 }
      },
      {
        avatar: 'anna_costume1_cameraA',
        background: 'office',
        script: 'And finally, let me return to a measured, thoughtful pace.',
        voiceSettings: { speed: 0.9, pitch: 0.95 }
      }
    ],
    test: true
  });
  
  return response.data;
}
```

## Language and Accent Considerations

### Optimizing for Non-Native Speakers

```typescript
const nonNativeOptimizations = {
  // Slower pace for better comprehension
  learners: {
    speed: 0.8,
    pitch: 1.0
  },
  
  // Clear pronunciation emphasis
  technical: {
    speed: 0.85,
    pitch: 1.0
  },
  
  // Conversational for practice
  conversational: {
    speed: 0.9,
    pitch: 1.05
  }
};

async function createForNonNativeSpeakers(script: string, level: 'beginner' | 'intermediate' | 'advanced') {
  const voiceSettings = {
    beginner: { speed: 0.7, pitch: 1.0 },
    intermediate: { speed: 0.85, pitch: 1.0 },
    advanced: { speed: 0.95, pitch: 1.0 }
  };
  
  const response = await synthesia.videos.createVideo({
    title: `Language Learning - ${level}`,
    scenes: [{
      avatar: 'mary_teacher_cameraA',
      background: 'library',
      script: script,
      voiceSettings: voiceSettings[level]
    }],
    test: true
  });
  
  return response.data;
}
```

## Voice Testing and A/B Testing

### Systematic Voice Testing

```typescript
async function voiceABTest(script: string, title: string) {
  const voiceVariants = [
    { name: 'Natural', settings: { speed: 1.0, pitch: 1.0 } },
    { name: 'Professional', settings: { speed: 0.95, pitch: 0.95 } },
    { name: 'Energetic', settings: { speed: 1.1, pitch: 1.1 } },
    { name: 'Authoritative', settings: { speed: 0.9, pitch: 0.85 } },
    { name: 'Friendly', settings: { speed: 1.05, pitch: 1.1 } }
  ];
  
  const testResults = await Promise.all(
    voiceVariants.map(async (variant, index) => {
      const response = await synthesia.videos.createVideo({
        title: `${title} - Voice Test ${variant.name}`,
        scenes: [{
          avatar: 'anna_costume1_cameraA',
          background: 'office',
          script: script,
          voiceSettings: variant.settings
        }],
        test: true
      });
      
      return {
        variant: variant.name,
        settings: variant.settings,
        videoId: response.data?.id,
        success: !!response.data
      };
    })
  );
  
  return testResults;
}
```

### Voice Performance Analytics

```typescript
class VoiceAnalytics {
  private performances: Array<{
    avatar: string;
    voiceSettings: any;
    contentType: string;
    rating: number;
    feedback: string;
  }> = [];
  
  recordPerformance(
    avatar: string,
    voiceSettings: any,
    contentType: string,
    rating: number,
    feedback: string = ''
  ) {
    this.performances.push({
      avatar,
      voiceSettings,
      contentType,
      rating,
      feedback
    });
  }
  
  getBestSettingsFor(avatar: string, contentType: string) {
    const matches = this.performances.filter(
      p => p.avatar === avatar && p.contentType === contentType
    );
    
    if (matches.length === 0) {
      return { speed: 1.0, pitch: 1.0 }; // Default
    }
    
    // Return settings with highest rating
    const best = matches.reduce((prev, current) =>
      prev.rating > current.rating ? prev : current
    );
    
    return best.voiceSettings;
  }
  
  getAnalytics() {
    const avgRating = this.performances.reduce((sum, p) => sum + p.rating, 0) / this.performances.length;
    
    const byContentType = this.performances.reduce((acc, p) => {
      if (!acc[p.contentType]) {
        acc[p.contentType] = [];
      }
      acc[p.contentType].push(p.rating);
      return acc;
    }, {} as Record<string, number[]>);
    
    return {
      totalTests: this.performances.length,
      averageRating: avgRating,
      contentTypePerformance: Object.entries(byContentType).map(([type, ratings]) => ({
        contentType: type,
        averageRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
        testCount: ratings.length
      }))
    };
  }
}

// Usage
const voiceAnalytics = new VoiceAnalytics();

// Record test results
voiceAnalytics.recordPerformance(
  'anna_costume1_cameraA',
  { speed: 1.1, pitch: 1.05 },
  'marketing',
  4.5,
  'Great energy and enthusiasm'
);

// Get best settings for future videos
const bestSettings = voiceAnalytics.getBestSettingsFor('anna_costume1_cameraA', 'marketing');
```

## Best Practices

### 1. Match Voice to Content

```typescript
const contentVoiceMapping = {
  // Formal content
  announcement: { speed: 0.95, pitch: 0.95 },
  policy: { speed: 0.9, pitch: 0.9 },
  legal: { speed: 0.85, pitch: 0.9 },
  
  // Educational content
  tutorial: { speed: 0.9, pitch: 1.05 },
  explanation: { speed: 0.85, pitch: 1.0 },
  training: { speed: 0.9, pitch: 1.0 },
  
  // Marketing content
  promotion: { speed: 1.2, pitch: 1.1 },
  product: { speed: 1.1, pitch: 1.05 },
  brand: { speed: 1.0, pitch: 1.05 },
  
  // Customer service
  support: { speed: 1.0, pitch: 1.1 },
  faq: { speed: 0.95, pitch: 1.05 },
  welcome: { speed: 1.05, pitch: 1.1 }
};
```

### 2. Consider Your Audience

```typescript
const audienceVoiceSettings = {
  executives: { speed: 0.95, pitch: 0.9 },   // Authoritative, measured
  employees: { speed: 1.0, pitch: 1.0 },     // Natural, clear
  customers: { speed: 1.05, pitch: 1.1 },    // Friendly, approachable
  students: { speed: 0.9, pitch: 1.05 },     // Clear, patient
  children: { speed: 0.85, pitch: 1.2 },     // Slow, high energy
  elderly: { speed: 0.8, pitch: 1.0 }        // Very clear, patient
};
```

### 3. Test and Iterate

```typescript
async function optimizeVoiceSettings(script: string, avatar: string) {
  const testSettings = [
    { speed: 0.9, pitch: 1.0 },
    { speed: 1.0, pitch: 1.0 },
    { speed: 1.1, pitch: 1.0 },
    { speed: 1.0, pitch: 0.9 },
    { speed: 1.0, pitch: 1.1 }
  ];
  
  const results = [];
  
  for (const settings of testSettings) {
    const response = await synthesia.videos.createVideo({
      title: `Voice Test - Speed: ${settings.speed}, Pitch: ${settings.pitch}`,
      scenes: [{
        avatar: avatar,
        background: 'office',
        script: script,
        voiceSettings: settings
      }],
      test: true
    });
    
    if (response.data) {
      results.push({
        settings,
        videoId: response.data.id
      });
    }
    
    // Rate limiting - wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}
```

## Troubleshooting Voice Issues

### Common Problems and Solutions

1. **Voice Sounds Unnatural**
   ```typescript
   // Avoid extreme settings
   const badSettings = { speed: 2.0, pitch: 2.0 }; // Too extreme
   const goodSettings = { speed: 1.1, pitch: 1.05 }; // Subtle adjustment
   ```

2. **Difficult to Understand**
   ```typescript
   // Slow down for clarity
   const claritySettings = { speed: 0.9, pitch: 1.0 };
   ```

3. **Lacks Emotion**
   ```typescript
   // Adjust pitch for emotion
   const emotionalSettings = { speed: 1.05, pitch: 1.1 };
   ```

### Voice Settings Validation

```typescript
function validateVoiceSettings(settings: { speed?: number; pitch?: number }) {
  const errors = [];
  
  if (settings.speed !== undefined) {
    if (settings.speed < 0.5 || settings.speed > 2.0) {
      errors.push('Speed must be between 0.5 and 2.0');
    }
  }
  
  if (settings.pitch !== undefined) {
    if (settings.pitch < 0.5 || settings.pitch > 2.0) {
      errors.push('Pitch must be between 0.5 and 2.0');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Usage
const validation = validateVoiceSettings({ speed: 1.5, pitch: 1.2 });
if (!validation.isValid) {
  console.error('Invalid voice settings:', validation.errors);
}
```

## Next Steps

- [Explore avatar options](/synthesia-sdk/resources/avatars/)
- [Learn about webhook events](/synthesia-sdk/resources/webhook-events/)
- [Read the API reference](/synthesia-sdk/api-reference/videos/)