import { Synthesia } from '../src';

async function templateUsageExample() {
  const synthesia = new Synthesia({
    apiKey: 'your-api-key-here',
  });

  try {
    console.log('Listing available templates...');
    
    const templatesResult = await synthesia.templates.listTemplates();
    
    if (templatesResult.error) {
      console.error('Error listing templates:', templatesResult.error.message);
      return;
    }

    const templates = templatesResult.data!.templates;
    console.log(`Found ${templates.length} templates`);

    if (templates.length === 0) {
      console.log('No templates available');
      return;
    }

    const template = templates[0];
    console.log(`Using template: ${template.name}`);
    console.log('Template variables:', template.variables);

    const templateData: Record<string, any> = {};
    
    template.variables.forEach(variable => {
      switch (variable.type) {
        case 'text':
          templateData[variable.name] = `Sample ${variable.name}`;
          break;
        case 'image':
          templateData[variable.name] = 'https://example.com/sample-image.jpg';
          break;
        case 'avatar':
          templateData[variable.name] = 'anna_costume1_cameraA';
          break;
        default:
          templateData[variable.name] = 'Sample value';
      }
    });

    console.log('Creating video from template...');
    
    const videoResult = await synthesia.videos.createVideoFromTemplate(
      template.id,
      templateData,
      {
        title: `Video from ${template.name}`,
        test: true,
      }
    );

    if (videoResult.error) {
      console.error('Error creating video from template:', videoResult.error.message);
      return;
    }

    console.log('Video created from template:', videoResult.data!.id);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

if (require.main === module) {
  templateUsageExample();
}