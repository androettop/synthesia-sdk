import { Synthesia, SynthesiaUtils } from '../src';
import { WebhookEvent } from '../src/types';

async function webhookUsageExample() {
  const synthesia = new Synthesia({
    apiKey: 'your-api-key-here',
  });

  try {
    console.log('Creating a webhook...');
    
    const webhookResult = await synthesia.webhooks.createWebhook({
      url: 'https://your-app.com/webhooks/synthesia',
      events: ['video.complete', 'video.failed'] as WebhookEvent[],
      secret: 'your-webhook-secret',
    });

    if (webhookResult.error) {
      console.error('Error creating webhook:', webhookResult.error.message);
      return;
    }

    const webhook = webhookResult.data!;
    console.log('Webhook created:', webhook.id);

    console.log('Listing all webhooks...');
    const listResult = await synthesia.webhooks.listWebhooks();
    
    if (listResult.error) {
      console.error('Error listing webhooks:', listResult.error.message);
      return;
    }

    console.log(`Found ${listResult.data!.count} webhooks`);

    console.log('Getting webhook details...');
    const getResult = await synthesia.webhooks.getWebhook(webhook.id);
    
    if (getResult.error) {
      console.error('Error getting webhook:', getResult.error.message);
      return;
    }

    console.log('Webhook events:', getResult.data!.events);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

function handleWebhookPayload(payload: string, signature: string, secret: string) {
  console.log('Handling webhook payload...');

  if (!SynthesiaUtils.validateWebhookSignature(payload, signature, secret)) {
    console.error('Invalid webhook signature');
    return;
  }

  try {
    const data = JSON.parse(payload);
    
    if (!SynthesiaUtils.isValidWebhookEvent(data.event)) {
      console.error('Invalid webhook event:', data.event);
      return;
    }

    switch (data.event) {
      case 'video.complete':
        console.log('Video completed:', data.video.id);
        console.log('Download URL:', data.video.download);
        break;
      
      case 'video.failed':
        console.log('Video failed:', data.video.id);
        console.log('Error:', data.error);
        break;
      
      case 'video.created':
        console.log('Video created:', data.video.id);
        break;
    }

  } catch (error) {
    console.error('Error parsing webhook payload:', error);
  }
}

if (require.main === module) {
  webhookUsageExample();
  
  const examplePayload = JSON.stringify({
    event: 'video.complete',
    video: {
      id: 'video-123',
      title: 'Test Video',
      status: 'complete',
      download: 'https://example.com/video.mp4',
    },
  });
  
  const exampleSignature = 'sha256=calculated-signature';
  const exampleSecret = 'your-webhook-secret';
  
  handleWebhookPayload(examplePayload, exampleSignature, exampleSecret);
}