---
title: Templates API
description: Retrieve and work with video templates for creating personalized content at scale.
sidebar:
  order: 2
---

The Templates API allows you to retrieve and work with video templates for creating personalized content at scale.

> 📖 **Official API Documentation**: [Synthesia Templates API](https://docs.synthesia.io/reference/retrieve-template)

## Overview

Templates are pre-designed video structures with variables that can be dynamically filled with custom content. They enable:
- Scalable video personalization
- Consistent branding and design
- Efficient content creation workflows
- Variable text, images, and avatar replacements

## Methods

### listTemplates()

Retrieve a list of available templates.

```typescript
async listTemplates(request?: ListTemplatesRequest): Promise<APIResponse<ListTemplatesResponse>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | `ListTemplatesRequest` | ❌ | Filtering options |

#### ListTemplatesRequest Interface

```typescript
interface ListTemplatesRequest {
  source?: 'synthesia' | 'workspace'; // Filter by template source
  offset?: number;   // Pagination offset
  limit?: number;    // Results per page (max 100)
}
```

#### Example

```typescript
// Get all templates
const response = await synthesia.templates.listTemplates();

// Get only Synthesia public templates
const response = await synthesia.templates.listTemplates({
  source: 'synthesia'
});

if (response.data) {
  console.log(`Found ${response.data.templates.length} templates`);
  response.data.templates.forEach(template => {
    console.log(`- ${template.title}`);
    console.log(`  Variables: ${template.variables.length}`);
  });
}
```

---

### getTemplate()

Retrieve detailed information about a specific template.

```typescript
async getTemplate(templateId: string): Promise<APIResponse<Template>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateId` | `string` | ✅ | The unique template identifier |

#### Example

```typescript
const response = await synthesia.templates.getTemplate('template-123');

if (response.data) {
  const template = response.data;
  console.log('Template:', template.title);
  console.log('Description:', template.description);
  
  // Inspect template variables
  template.variables.forEach(variable => {
    console.log(`Variable: ${variable.name}`);
    console.log(`  Type: ${variable.type}`);
    console.log(`  Required: ${variable.required}`);
    console.log(`  Description: ${variable.description || 'N/A'}`);
  });
}
```

---

### getSynthesiaTemplates()

Retrieve only Synthesia-provided public templates.

```typescript
async getSynthesiaTemplates(): Promise<APIResponse<ListTemplatesResponse>>
```

#### Example

```typescript
const response = await synthesia.templates.getSynthesiaTemplates();

if (response.data) {
  console.log(`Found ${response.data.count} Synthesia templates`);
  
  // Find templates suitable for specific use cases
  const marketingTemplates = response.data.templates.filter(template =>
    template.name.toLowerCase().includes('marketing') ||
    template.description?.toLowerCase().includes('marketing')
  );
  
  console.log(`Marketing templates: ${marketingTemplates.length}`);
}
```

---

### getWorkspaceTemplates()

Retrieve templates created within your workspace.

```typescript
async getWorkspaceTemplates(): Promise<APIResponse<ListTemplatesResponse>>
```

#### Example

```typescript
const response = await synthesia.templates.getWorkspaceTemplates();

if (response.data) {
  console.log(`Found ${response.data.count} workspace templates`);
  
  response.data.templates.forEach(template => {
    console.log(`- ${template.name}`);
    if (template.thumbnailUrl) {
      console.log(`  Thumbnail: ${template.thumbnailUrl}`);
    }
  });
}
```

## Working with Templates

### Template Variables

Templates contain variables that can be replaced with custom content:

```typescript
const response = await synthesia.templates.getTemplate('welcome-template');

if (response.data) {
  const template = response.data;
  
  // Analyze required variables
  const requiredVars = template.variables.filter(v => v.required);
  console.log('Required variables:');
  
  requiredVars.forEach(variable => {
    console.log(`- ${variable.name} (${variable.type})`);
  });
}
```

### Creating Videos from Templates

Use template data to create personalized videos:

```typescript
// Get template details
const templateResponse = await synthesia.templates.getTemplate('customer-welcome');

if (templateResponse.data) {
  const template = templateResponse.data;
  
  // Prepare variable data based on template requirements
  const templateData: Record<string, any> = {};
  
  template.variables.forEach(variable => {
    switch (variable.name) {
      case 'customer_name':
        templateData[variable.name] = 'John Doe';
        break;
      case 'company_logo':
        templateData[variable.name] = 'https://example.com/logo.png';
        break;
      case 'welcome_message':
        templateData[variable.name] = 'Welcome to our premium service!';
        break;
      case 'avatar':
        templateData[variable.name] = 'anna_costume1_cameraA';
        break;
    }
  });
  
  // Create video from template
  const videoResponse = await synthesia.videos.createVideoFromTemplate(
    template.id,
    templateData,
    {
      title: `Welcome Video for ${templateData.customer_name}`,
      test: true
    }
  );
  
  if (videoResponse.data) {
    console.log('Video created:', videoResponse.data.id);
  }
}
```

## TypeScript Interfaces

### Template

```typescript
interface Template {
  id: string;               // Unique template identifier
  name: string;             // Template display name
  description?: string;     // Template description
  variables: TemplateVariable[]; // Available variables
  thumbnailUrl?: string;    // Preview thumbnail URL
  source: 'synthesia' | 'workspace'; // Template source
}
```

### TemplateVariable

```typescript
interface TemplateVariable {
  name: string;             // Variable name (used as key in data)
  type: 'text' | 'image' | 'video' | 'avatar'; // Variable type
  required: boolean;        // Whether variable is required
  description?: string;     // Variable description/usage notes
}
```

### ListTemplatesResponse

```typescript
interface ListTemplatesResponse {
  templates: Template[];    // Array of templates
  count: number;           // Total number of templates
}
```

## Variable Types

| Type | Description | Example Value |
|------|-------------|---------------|
| `text` | Text content for replacement | `"Welcome, John!"` |
| `image` | Image URL or asset ID | `"https://example.com/image.jpg"` |
| `video` | Video URL or asset ID | `"https://example.com/video.mp4"` |
| `avatar` | Avatar identifier | `"anna_costume1_cameraA"` |

## Template Sources

| Source | Description |
|--------|-------------|
| `synthesia` | Public templates provided by Synthesia |
| `workspace` | Custom templates created in your workspace |

## Best Practices

### 1. Validate Template Variables

```typescript
async function validateTemplateData(
  templateId: string, 
  data: Record<string, any>
): Promise<boolean> {
  const response = await synthesia.templates.getTemplate(templateId);
  
  if (!response.data) {
    throw new Error('Template not found');
  }
  
  const template = response.data;
  const requiredVars = template.variables.filter(v => v.required);
  
  // Check all required variables are provided
  for (const variable of requiredVars) {
    if (!(variable.name in data) || data[variable.name] == null) {
      console.error(`Missing required variable: ${variable.name}`);
      return false;
    }
  }
  
  // Validate variable types
  for (const variable of template.variables) {
    const value = data[variable.name];
    if (value != null) {
      if (variable.type === 'text' && typeof value !== 'string') {
        console.error(`Variable ${variable.name} must be a string`);
        return false;
      }
      // Add more type validations as needed
    }
  }
  
  return true;
}
```

### 2. Dynamic Template Selection

```typescript
async function selectTemplateForUseCase(useCase: string): Promise<Template | null> {
  const response = await synthesia.templates.listTemplates();
  
  if (!response.data) return null;
  
  // Find template based on name or description
  const suitable = response.data.templates.find(template =>
    template.name.toLowerCase().includes(useCase.toLowerCase()) ||
    template.description?.toLowerCase().includes(useCase.toLowerCase())
  );
  
  return suitable || null;
}

// Usage
const template = await selectTemplateForUseCase('onboarding');
if (template) {
  console.log(`Found template: ${template.name}`);
}
```

### 3. Batch Video Creation

```typescript
async function createPersonalizedVideos(
  templateId: string,
  customers: Array<{ name: string; email: string; plan: string }>
): Promise<string[]> {
  const videoIds: string[] = [];
  
  for (const customer of customers) {
    const response = await synthesia.videos.createVideoFromTemplate(
      templateId,
      {
        customer_name: customer.name,
        plan_name: customer.plan,
        support_email: 'support@company.com'
      },
      {
        title: `Welcome Video - ${customer.name}`,
        visibility: 'private'
      }
    );
    
    if (response.data) {
      videoIds.push(response.data.id);
      console.log(`Created video for ${customer.name}: ${response.data.id}`);
    }
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return videoIds;
}
```

## Error Handling

```typescript
try {
  const response = await synthesia.templates.getTemplate('template-123');
  
  if (response.error) {
    switch (response.error.statusCode) {
      case 404:
        console.error('Template not found');
        break;
      case 403:
        console.error('Access denied to template');
        break;
      default:
        console.error('API Error:', response.error.message);
    }
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

## Integration Examples

### E-commerce Personalization

```typescript
async function createProductVideo(productData: {
  name: string;
  price: number;
  imageUrl: string;
  customerName: string;
}) {
  const template = await selectTemplateForUseCase('product showcase');
  
  if (!template) {
    throw new Error('No suitable template found');
  }
  
  return synthesia.videos.createVideoFromTemplate(
    template.id,
    {
      product_name: productData.name,
      product_price: `$${productData.price}`,
      product_image: productData.imageUrl,
      customer_name: productData.customerName
    },
    {
      title: `${productData.name} - Personalized for ${productData.customerName}`,
      test: false // Production video
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
}) {
  const response = await synthesia.templates.getTemplate('education-lesson');
  
  if (response.data) {
    return synthesia.videos.createVideoFromTemplate(
      response.data.id,
      {
        lesson_title: lesson.title,
        lesson_content: lesson.content,
        student_name: lesson.studentName,
        progress: `${lesson.courseProgress}%`,
        avatar: 'teacher_avatar_professional'
      },
      {
        title: `${lesson.title} - ${lesson.studentName}`,
        visibility: 'private'
      }
    );
  }
}
```

## Next Steps

- [Create videos using templates](/synthesia-sdk/guides/templates/)
- [Learn about the Videos API](/synthesia-sdk/api-reference/videos/)
