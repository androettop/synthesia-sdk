---
title: Supported Avatars
description: Complete reference for all available avatars in the Synthesia platform.
sidebar:
  order: 1
---

Complete reference for all available avatars in the Synthesia platform.

> 📖 **Official Documentation**: [Synthesia Stock Avatars](https://docs.synthesia.io/reference/supported-stock-avatars)

## Professional Avatars

Perfect for business presentations, corporate communications, and professional content.

### Female Professional Avatars

```typescript
// Anna - Professional businesswoman
'anna_costume1_cameraA'     // Business suit, front-facing
'anna_costume1_cameraB'     // Business suit, side angle

// Sophia - Young professional
'sophia_costume1_cameraA'   // Professional attire, confident pose
'sophia_costume1_cameraB'   // Professional attire, slight angle

// Emma - Corporate executive
'emma_costume1_cameraA'     // Executive style, authoritative
'emma_costume1_cameraB'     // Executive style, engaging

// Lisa - Tech professional
'lisa_costume1_cameraA'     // Modern professional look
'lisa_costume1_cameraB'     // Casual professional style
```

### Male Professional Avatars

```typescript
// James - Senior executive
'james_costume1_cameraA'    // Business suit, executive presence
'james_costume1_cameraB'    // Business suit, approachable

// David - Mature professional
'david_costume1_cameraA'    // Distinguished professional
'david_costume1_cameraB'    // Experienced consultant style

// Michael - Corporate manager
'michael_costume1_cameraA'  // Management style, confident
'michael_costume1_cameraB'  // Leadership presence

// Alex - Tech professional
'alex_costume1_cameraA'     // Modern professional
'alex_costume1_cameraB'     // Startup/tech style
```

## Casual Avatars

Great for tutorials, educational content, and informal communications.

### Female Casual Avatars

```typescript
// Anna - Casual friendly
'anna_costume2_cameraA'     // Casual top, approachable
'anna_costume2_cameraB'     // Relaxed style

// Sophia - Young and casual
'sophia_costume2_cameraA'   // Casual educator style
'sophia_costume2_cameraB'   // Friendly instructor

// Emma - Casual expert
'emma_costume2_cameraA'     // Casual but knowledgeable
'emma_costume2_cameraB'     // Approachable expert

// Lisa - Tech casual
'lisa_costume2_cameraA'     // Casual tech style
'lisa_costume2_cameraB'     // Startup casual
```

### Male Casual Avatars

```typescript
// James - Casual professional
'james_costume2_cameraA'    // Smart casual, friendly
'james_costume2_cameraB'    // Approachable instructor

// David - Casual expert
'david_costume2_cameraA'    // Experienced but approachable
'david_costume2_cameraB'    // Mentor style

// Michael - Casual manager
'michael_costume2_cameraA'  // Relaxed leadership
'michael_costume2_cameraB'  // Coaching style

// Alex - Casual tech
'alex_costume2_cameraA'     // Developer style
'alex_costume2_cameraB'     // Tech mentor
```

## Specialized Avatars

For specific industries or use cases.

### Healthcare & Medical

```typescript
// Dr. Sarah - Medical professional
'sarah_medical_cameraA'     // White coat, professional
'sarah_medical_cameraB'     // Healthcare setting

// Dr. Robert - Senior physician
'robert_medical_cameraA'    // Experienced doctor
'robert_medical_cameraB'    // Medical consultant
```

### Education & Training

```typescript
// Professor Williams - Academic
'williams_academic_cameraA' // University professor style
'williams_academic_cameraB' // Lecture hall setting

// Teacher Mary - School educator
'mary_teacher_cameraA'      // Classroom teacher
'mary_teacher_cameraB'      // Educational presenter
```

### Customer Service

```typescript
// Kelly - Customer support
'kelly_support_cameraA'     // Friendly service rep
'kelly_support_cameraB'     // Helpful assistant

// Tom - Technical support
'tom_support_cameraA'       // Tech support specialist
'tom_support_cameraB'       // Problem solver
```

## Avatar Selection Guide

### By Use Case

```typescript
const avatarsByUseCase = {
  // Business presentations
  businessPresentation: [
    'james_costume1_cameraA',
    'anna_costume1_cameraA',
    'david_costume1_cameraA',
    'sophia_costume1_cameraA'
  ],
  
  // Training and tutorials
  training: [
    'anna_costume2_cameraA',
    'james_costume2_cameraA',
    'lisa_costume1_cameraA',
    'alex_costume2_cameraA'
  ],
  
  // Customer communications
  customerComms: [
    'sophia_costume1_cameraA',
    'james_costume1_cameraA',
    'emma_costume1_cameraA',
    'michael_costume1_cameraA'
  ],
  
  // Educational content
  education: [
    'williams_academic_cameraA',
    'mary_teacher_cameraA',
    'anna_costume2_cameraA',
    'david_costume2_cameraA'
  ],
  
  // Technical explanations
  technical: [
    'alex_costume1_cameraA',
    'lisa_costume1_cameraA',
    'tom_support_cameraA',
    'james_costume2_cameraA'
  ]
};

// Usage example
function selectAvatar(useCase: string): string {
  const avatars = avatarsByUseCase[useCase];
  return avatars ? avatars[0] : 'anna_costume1_cameraA'; // Default fallback
}
```

### By Industry

```typescript
const avatarsByIndustry = {
  technology: [
    'alex_costume1_cameraA',
    'lisa_costume1_cameraA',
    'james_costume2_cameraA'
  ],
  
  finance: [
    'james_costume1_cameraA',
    'david_costume1_cameraA',
    'emma_costume1_cameraA'
  ],
  
  healthcare: [
    'sarah_medical_cameraA',
    'robert_medical_cameraA',
    'lisa_costume1_cameraA'
  ],
  
  education: [
    'williams_academic_cameraA',
    'mary_teacher_cameraA',
    'sophia_costume2_cameraA'
  ],
  
  retail: [
    'sophia_costume1_cameraA',
    'kelly_support_cameraA',
    'anna_costume2_cameraA'
  ],
  
  consulting: [
    'david_costume1_cameraA',
    'james_costume1_cameraA',
    'emma_costume1_cameraA'
  ]
};
```

## Avatar Characteristics

### Voice and Personality Traits

| Avatar | Gender | Age Range | Voice Tone | Personality | Best For |
|--------|--------|-----------|------------|-------------|----------|
| Anna (Professional) | Female | 25-35 | Clear, confident | Professional, approachable | Business presentations |
| Anna (Casual) | Female | 25-35 | Warm, friendly | Casual, relatable | Tutorials, training |
| James (Professional) | Male | 35-45 | Authoritative, clear | Executive, decisive | Leadership content |
| James (Casual) | Male | 35-45 | Friendly, engaging | Approachable, expert | Explanatory videos |
| Sophia (Professional) | Female | 22-30 | Energetic, clear | Young professional | Modern business |
| Sophia (Casual) | Female | 22-30 | Enthusiastic, warm | Youthful, engaging | Educational content |
| David (Professional) | Male | 45-55 | Mature, authoritative | Experienced, wise | Senior presentations |
| David (Casual) | Male | 45-55 | Warm, experienced | Mentor, guide | Training, coaching |

### Camera Angles

| Angle | Description | Best For |
|-------|-------------|----------|
| cameraA | Direct front-facing | Formal presentations, announcements |
| cameraB | Slight side angle | Conversational content, tutorials |

## Usage Examples

### Basic Avatar Usage

```typescript
async function createWithSpecificAvatar() {
  const response = await synthesia.videos.createVideo({
    title: 'Professional Presentation',
    scriptText: 'Welcome to our quarterly business review.',
    avatar: 'james_costume1_cameraA', // Professional male
    background: 'office',
    test: true
  });
  
  return response.data;
}
```

### Dynamic Avatar Selection

```typescript
function selectAvatarForContent(contentType: string, targetAudience: string) {
  // Business content for executives
  if (contentType === 'business' && targetAudience === 'executives') {
    return 'james_costume1_cameraA';
  }
  
  // Technical content for developers
  if (contentType === 'technical' && targetAudience === 'developers') {
    return 'alex_costume2_cameraA';
  }
  
  // Educational content for students
  if (contentType === 'educational' && targetAudience === 'students') {
    return 'mary_teacher_cameraA';
  }
  
  // Customer support content
  if (contentType === 'support') {
    return 'kelly_support_cameraA';
  }
  
  // Default professional avatar
  return 'anna_costume1_cameraA';
}

async function createTargetedVideo(content: {
  title: string;
  script: string;
  type: string;
  audience: string;
}) {
  const avatar = selectAvatarForContent(content.type, content.audience);
  
  const response = await synthesia.videos.createVideo({
    title: content.title,
    scriptText: content.script,
    avatar: avatar,
    background: 'office',
    test: true
  });
  
  return response.data;
}
```

### A/B Testing with Different Avatars

```typescript
async function createABTestVideos(script: string, title: string) {
  const avatarVariants = [
    'anna_costume1_cameraA',  // Professional female
    'james_costume1_cameraA', // Professional male
    'sophia_costume2_cameraA', // Casual young female
    'alex_costume2_cameraA'   // Casual male
  ];
  
  const videos = await Promise.all(
    avatarVariants.map((avatar, index) =>
      synthesia.videos.createVideo({
        title: `${title} - Variant ${index + 1}`,
        scriptText: script,
        avatar: avatar,
        background: 'office',
        test: true
      })
    )
  );
  
  return videos.map(v => v.data).filter(Boolean);
}
```

## Best Practices

### Avatar Selection Guidelines

1. **Match Avatar to Content Tone**
   ```typescript
   // Formal business content
   const businessAvatar = 'james_costume1_cameraA';
   
   // Casual tutorial content  
   const tutorialAvatar = 'anna_costume2_cameraA';
   
   // Technical documentation
   const techAvatar = 'alex_costume1_cameraA';
   ```

2. **Consider Your Audience**
   ```typescript
   const audienceAvatars = {
     executives: 'david_costume1_cameraA',
     youngProfessionals: 'sophia_costume1_cameraA',
     students: 'mary_teacher_cameraA',
     customers: 'kelly_support_cameraA'
   };
   ```

3. **Maintain Consistency**
   ```typescript
   // Use the same avatar across a video series
   const seriesAvatar = 'anna_costume1_cameraA';
   
   const videoSeries = [
     { title: 'Introduction', avatar: seriesAvatar },
     { title: 'Chapter 1', avatar: seriesAvatar },
     { title: 'Chapter 2', avatar: seriesAvatar }
   ];
   ```

### Voice Settings per Avatar

```typescript
const avatarVoiceSettings = {
  'anna_costume1_cameraA': {
    speed: 1.0,
    pitch: 1.0 // Natural, professional
  },
  'james_costume1_cameraA': {
    speed: 0.95,
    pitch: 0.9 // Slightly slower, authoritative
  },
  'sophia_costume2_cameraA': {
    speed: 1.1,
    pitch: 1.05 // Energetic, engaging
  },
  'alex_costume2_cameraA': {
    speed: 1.0,
    pitch: 0.95 // Technical, clear
  }
};

function getOptimalVoiceSettings(avatar: string) {
  return avatarVoiceSettings[avatar] || { speed: 1.0, pitch: 1.0 };
}
```

## Troubleshooting

### Common Issues

1. **Avatar Not Found Error**
   ```typescript
   // Always validate avatar IDs
   const validAvatars = [
     'anna_costume1_cameraA',
     'james_costume1_cameraA',
     'sophia_costume1_cameraA'
   ];
   
   function validateAvatar(avatarId: string): boolean {
     return validAvatars.includes(avatarId);
   }
   ```

2. **Inconsistent Avatar Appearance**
   ```typescript
   // Use the same camera angle for consistency
   const consistentAvatar = 'anna_costume1_cameraA'; // Always cameraA
   ```

3. **Avatar Not Suitable for Content**
   ```typescript
   // Match avatar formality to content
   const formalContent = 'james_costume1_cameraA';  // Business suit
   const casualContent = 'james_costume2_cameraA';  // Casual attire
   ```

## Avatar Updates

Synthesia regularly adds new avatars. To get the latest list:

```typescript
// Check template avatars for the most up-to-date list
async function getAvailableAvatars() {
  const templates = await synthesia.templates.listTemplates();
  
  if (templates.data) {
    const avatarVariables = templates.data.templates
      .flatMap(template => template.variables)
      .filter(variable => variable.type === 'avatar')
      .map(variable => variable.name);
      
    return [...new Set(avatarVariables)]; // Unique avatars
  }
  
  return [];
}
```

## Next Steps

- [Explore background options](./backgrounds.md)
- [Learn about voice settings](./voices.md)
- [See avatar examples in action](../examples/avatar-showcase.md)
- [Read the Videos API reference](../api-reference/videos.md)