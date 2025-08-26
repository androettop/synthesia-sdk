---
title: Working with Templates
description: Learn how to use Synthesia templates to create personalized videos at scale.
sidebar:
  order: 2
---

Learn how to use Synthesia templates to create personalized videos at scale with consistent branding and design.

> 📖 **Official API Documentation**: [Synthesia Templates](https://docs.synthesia.io/reference/retrieve-template)

## What are Templates?

Templates are pre-designed video structures with customizable elements (variables) that can be filled with your content. They enable:

- **Scalable personalization** - Create hundreds of personalized videos
- **Consistent branding** - Maintain visual consistency across videos  
- **Efficient workflows** - Reduce setup time for similar videos
- **Dynamic content** - Text, images, avatars, and audio can be customized

## Template Basics

### Finding Available Templates

```typescript
import { Synthesia } from '@androettop/synthesia-sdk';

const synthesia = new Synthesia({
  apiKey: process.env.SYNTHESIA_API_KEY,
});

// Get all templates
const allTemplates = await synthesia.templates.listTemplates();

// Get only Synthesia public templates
const publicTemplates = await synthesia.templates.getSynthesiaTemplates();

// Get your workspace templates
const workspaceTemplates = await synthesia.templates.getWorkspaceTemplates();

console.log(`Found ${allTemplates.data?.count} total templates`);
```

### Exploring Template Details

```typescript
// Get detailed information about a template
const templateResponse = await synthesia.templates.getTemplate('template-id');

if (templateResponse.data) {
  const template = templateResponse.data;
  
  console.log('Template:', template.name);
  console.log('Description:', template.description);
  console.log('Source:', template.source); // 'synthesia' or 'workspace'
  
  // Examine available variables
  console.log('\nTemplate Variables:');
  template.variables.forEach(variable => {
    console.log(`- ${variable.name} (${variable.type})`);
    console.log(`  Required: ${variable.required}`);
    console.log(`  Description: ${variable.description || 'N/A'}`);
  });
}
```

## Creating Videos from Templates

### Basic Template Usage

```typescript
async function createFromTemplate() {
  // First, get template details to understand required variables
  const template = await synthesia.templates.getTemplate('welcome-template');
  
  if (!template.data) {
    throw new Error('Template not found');
  }
  
  // Prepare data for template variables
  const templateData = {
    customer_name: 'John Doe',
    company_name: 'Acme Corporation',
    welcome_message: 'Welcome to our premium service!',
    avatar: 'anna_costume1_cameraA'
  };
  
  // Create video from template
  const videoResponse = await synthesia.videos.createVideoFromTemplate(
    'welcome-template',
    templateData,
    {
      title: `Welcome Video for ${templateData.customer_name}`,
      test: true,
      visibility: 'private'
    }
  );
  
  if (videoResponse.data) {
    console.log('Video created:', videoResponse.data.id);
    return videoResponse.data.id;
  }
}
```

### Advanced Template Usage with Validation

```typescript
async function createValidatedTemplateVideo(templateId: string, userData: any) {
  // Get template structure
  const templateResponse = await synthesia.templates.getTemplate(templateId);
  
  if (!templateResponse.data) {
    throw new Error('Template not found');
  }
  
  const template = templateResponse.data;
  
  // Validate required variables
  const missingRequired = template.variables
    .filter(v => v.required && !(v.name in userData))
    .map(v => v.name);
    
  if (missingRequired.length > 0) {
    throw new Error(`Missing required variables: ${missingRequired.join(', ')}`);
  }
  
  // Validate variable types
  for (const variable of template.variables) {
    const value = userData[variable.name];
    if (value !== undefined && value !== null) {
      if (!validateVariableType(variable, value)) {
        throw new Error(`Invalid type for variable ${variable.name}`);
      }
    }
  }
  
  // Create video with validated data
  return synthesia.videos.createVideoFromTemplate(templateId, userData, {
    title: generateVideoTitle(template.name, userData),
    test: process.env.NODE_ENV === 'development'
  });
}

function validateVariableType(variable: any, value: any): boolean {
  switch (variable.type) {
    case 'text':
      return typeof value === 'string';
    case 'image':
    case 'video':
    case 'avatar':
      return typeof value === 'string'; // Should be URL or asset ID
    default:
      return true;
  }
}

function generateVideoTitle(templateName: string, userData: any): string {
  const customerName = userData.customer_name || userData.name || 'Customer';
  return `${templateName} - ${customerName}`;
}
```

## Template Variable Types

### Text Variables
Used for customizable text content:

```typescript
const templateData = {
  // Simple text replacement
  customer_name: 'Sarah Johnson',
  company_name: 'Tech Solutions Inc.',
  
  // Longer text content
  welcome_message: `
    Thank you for choosing our service. 
    We're excited to help you achieve your goals!
  `,
  
  // Numbers and formatted text
  discount_amount: '25%',
  expiry_date: 'December 31, 2024'
};
```

### Image Variables
Replace placeholder images with custom content:

```typescript
const templateData = {
  // Using URLs
  company_logo: 'https://your-site.com/logo.png',
  product_image: 'https://your-site.com/product.jpg',
  
  // Using uploaded asset IDs
  background_image: 'asset-123', // From uploads API
  profile_picture: 'asset-456'
};
```

### Avatar Variables
Customize which avatar appears in the video:

```typescript
const templateData = {
  // Professional avatars
  presenter_avatar: 'anna_costume1_cameraA',
  support_avatar: 'james_costume1_cameraA',
  
  // Casual avatars
  welcome_avatar: 'sophia_costume2_cameraA'
};
```

### Video Variables
Include custom video content:

```typescript
const templateData = {
  // Background videos
  background_video: 'asset-789', // Uploaded video asset
  
  // Product demo clips
  demo_video: 'https://your-site.com/demo.mp4'
};
```

## Common Template Patterns

### Customer Onboarding

```typescript
async function createOnboardingVideo(customer: {
  name: string;
  email: string;
  plan: string;
  companyLogo?: string;
}) {
  const templateData = {
    customer_name: customer.name,
    plan_name: customer.plan,
    support_email: 'support@yourcompany.com',
    company_logo: customer.companyLogo || 'default-logo-asset-id',
    avatar: 'anna_costume1_cameraA'
  };
  
  return synthesia.videos.createVideoFromTemplate(
    'customer-onboarding-template',
    templateData,
    {
      title: `Welcome ${customer.name} - Getting Started`,
      visibility: 'private'
    }
  );
}

// Usage
const video = await createOnboardingVideo({
  name: 'Alice Cooper',
  email: 'alice@example.com',
  plan: 'Premium',
  companyLogo: 'https://example.com/logo.png'
});
```

### Product Updates

```typescript
async function createProductUpdateVideo(update: {
  featureName: string;
  description: string;
  releaseDate: string;
  demoVideo?: string;
}) {
  const templateData = {
    feature_name: update.featureName,
    feature_description: update.description,
    release_date: update.releaseDate,
    demo_video: update.demoVideo || 'default-demo-asset-id',
    avatar: 'james_costume1_cameraA'
  };
  
  return synthesia.videos.createVideoFromTemplate(
    'product-update-template',
    templateData,
    {
      title: `New Feature: ${update.featureName}`,
      visibility: 'public'
    }
  );
}
```

### Educational Content

```typescript
async function createLessonVideo(lesson: {
  title: string;
  content: string;
  studentName: string;
  courseProgress: number;
  materials?: string[];
}) {
  const templateData = {
    lesson_title: lesson.title,
    lesson_content: lesson.content,
    student_name: lesson.studentName,
    progress_percentage: `${lesson.courseProgress}%`,
    course_materials: lesson.materials?.join('\n• ') || 'No additional materials',
    avatar: 'sophia_costume1_cameraA'
  };
  
  return synthesia.videos.createVideoFromTemplate(
    'educational-lesson-template',
    templateData,
    {
      title: `${lesson.title} - ${lesson.studentName}`,
      visibility: 'private'
    }
  );
}
```

## Batch Video Creation

### Sequential Processing

```typescript
async function createPersonalizedVideos(
  templateId: string,
  customers: Array<{ name: string; email: string; plan: string }>
) {
  const videoIds: string[] = [];
  
  for (const customer of customers) {
    try {
      const response = await synthesia.videos.createVideoFromTemplate(
        templateId,
        {
          customer_name: customer.name,
          customer_email: customer.email,
          plan_name: customer.plan,
          avatar: 'anna_costume1_cameraA'
        },
        {
          title: `Personalized Video - ${customer.name}`,
          visibility: 'private'
        }
      );
      
      if (response.data) {
        videoIds.push(response.data.id);
        console.log(`✅ Created video for ${customer.name}: ${response.data.id}`);
      }
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to create video for ${customer.name}:`, error);
    }
  }
  
  return videoIds;
}
```

### Parallel Processing (with Rate Limiting)

```typescript
import pLimit from 'p-limit';

async function createVideosInParallel(
  templateId: string, 
  dataList: Array<Record<string, any>>,
  concurrency = 3
) {
  const limit = pLimit(concurrency); // Limit concurrent requests
  
  const videoPromises = dataList.map((data, index) =>
    limit(async () => {
      try {
        const response = await synthesia.videos.createVideoFromTemplate(
          templateId,
          data,
          {
            title: `Video ${index + 1}`,
            test: true
          }
        );
        
        return response.data?.id;
      } catch (error) {
        console.error(`Failed to create video ${index + 1}:`, error);
        return null;
      }
    })
  );
  
  const results = await Promise.all(videoPromises);
  const successfulIds = results.filter(id => id !== null);
  
  console.log(`Created ${successfulIds.length}/${dataList.length} videos`);
  return successfulIds;
}
```

## Template Helper Functions

### Template Discovery

```typescript
async function findTemplateByCategory(category: string) {
  const response = await synthesia.templates.listTemplates();
  
  if (!response.data) return [];
  
  return response.data.templates.filter(template =>
    template.name.toLowerCase().includes(category.toLowerCase()) ||
    template.description?.toLowerCase().includes(category.toLowerCase())
  );
}

// Usage
const marketingTemplates = await findTemplateByCategory('marketing');
const educationTemplates = await findTemplateByCategory('education');
const onboardingTemplates = await findTemplateByCategory('onboarding');
```

### Variable Analysis

```typescript
function analyzeTemplateVariables(template: any) {
  const analysis = {
    required: template.variables.filter((v: any) => v.required),
    optional: template.variables.filter((v: any) => !v.required),
    byType: {} as Record<string, any[]>
  };
  
  // Group by type
  template.variables.forEach((variable: any) => {
    if (!analysis.byType[variable.type]) {
      analysis.byType[variable.type] = [];
    }
    analysis.byType[variable.type].push(variable);
  });
  
  return analysis;
}

// Usage
const template = await synthesia.templates.getTemplate('template-id');
if (template.data) {
  const analysis = analyzeTemplateVariables(template.data);
  console.log('Required variables:', analysis.required.map(v => v.name));
  console.log('Text variables:', analysis.byType.text?.length || 0);
  console.log('Image variables:', analysis.byType.image?.length || 0);
}
```

### Data Validation Helper

```typescript
class TemplateValidator {
  async validateData(templateId: string, data: Record<string, any>) {
    const templateResponse = await synthesia.templates.getTemplate(templateId);
    
    if (!templateResponse.data) {
      throw new Error('Template not found');
    }
    
    const template = templateResponse.data;
    const errors: string[] = [];
    
    // Check required fields
    template.variables.forEach(variable => {
      if (variable.required && !(variable.name in data)) {
        errors.push(`Missing required variable: ${variable.name}`);
      }
    });
    
    // Validate types
    Object.entries(data).forEach(([key, value]) => {
      const variable = template.variables.find(v => v.name === key);
      if (variable && !this.isValidType(variable.type, value)) {
        errors.push(`Invalid type for ${key}: expected ${variable.type}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      template
    };
  }
  
  private isValidType(expectedType: string, value: any): boolean {
    switch (expectedType) {
      case 'text':
        return typeof value === 'string';
      case 'image':
      case 'video':
      case 'avatar':
        return typeof value === 'string' && value.length > 0;
      default:
        return true;
    }
  }
}

// Usage
const validator = new TemplateValidator();
const validation = await validator.validateData('template-id', templateData);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
} else {
  console.log('Data is valid, creating video...');
}
```

## Best Practices

### 1. Template Selection Strategy

```typescript
async function selectBestTemplate(useCase: string, requirements: string[]) {
  const templates = await synthesia.templates.listTemplates();
  
  if (!templates.data) return null;
  
  // Score templates based on name/description match
  const scored = templates.data.templates.map(template => {
    let score = 0;
    
    // Check name match
    if (template.name.toLowerCase().includes(useCase.toLowerCase())) {
      score += 10;
    }
    
    // Check description match
    if (template.description?.toLowerCase().includes(useCase.toLowerCase())) {
      score += 5;
    }
    
    // Check if template has required variables
    requirements.forEach(req => {
      if (template.variables.some(v => v.name.includes(req))) {
        score += 2;
      }
    });
    
    return { template, score };
  });
  
  // Return highest scoring template
  const best = scored.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.template : null;
}
```

### 2. Caching Template Metadata

```typescript
class TemplateCache {
  private cache = new Map<string, any>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  
  async getTemplate(templateId: string) {
    const cached = this.cache.get(templateId);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.template;
    }
    
    const response = await synthesia.templates.getTemplate(templateId);
    
    if (response.data) {
      this.cache.set(templateId, {
        template: response.data,
        timestamp: Date.now()
      });
    }
    
    return response.data;
  }
  
  clearCache() {
    this.cache.clear();
  }
}
```

### 3. Environment-Specific Template Usage

```typescript
const getTemplateConfig = (environment: 'development' | 'staging' | 'production') => {
  const configs = {
    development: {
      test: true,
      visibility: 'private',
      avatar: 'anna_costume1_cameraA' // Consistent for testing
    },
    staging: {
      test: true,
      visibility: 'private',
      avatar: 'anna_costume1_cameraA'
    },
    production: {
      test: false,
      visibility: 'public',
      // Use dynamic avatar selection in production
    }
  };
  
  return configs[environment];
};

// Usage
const config = getTemplateConfig(process.env.NODE_ENV as any);
const video = await synthesia.videos.createVideoFromTemplate(
  templateId,
  templateData,
  config
);
```

## Troubleshooting

### Template Not Found
```typescript
const response = await synthesia.templates.getTemplate('template-id');
if (!response.data) {
  console.error('Template not found. Check template ID.');
  // List available templates to find correct ID
  const available = await synthesia.templates.listTemplates();
  console.log('Available templates:', available.data?.templates.map(t => t.id));
}
```

### Missing Variable Values
```typescript
// Always validate before creating
if (!templateData.customer_name) {
  throw new Error('customer_name is required for this template');
}
```

### Variable Type Mismatch
```typescript
// Ensure correct types
const templateData = {
  customer_name: String(userData.name),      // Ensure string
  avatar: userData.avatar || 'default_avatar', // Provide fallback
  company_logo: userData.logo_url || null    // Handle optional fields
};
```

## Next Steps

- [Set up webhooks for template videos](/synthesia-sdk/guides/webhooks/)
- [API Reference: Templates](/synthesia-sdk/api-reference/templates/)