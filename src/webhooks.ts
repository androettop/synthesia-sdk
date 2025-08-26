import { SynthesiaClient } from './client';
import {
  Webhook,
  CreateWebhookRequest,
  ListWebhooksResponse,
  APIResponse,
} from './types';

export class WebhooksAPI extends SynthesiaClient {
  async createWebhook(request: CreateWebhookRequest): Promise<APIResponse<Webhook>> {
    return this.post<Webhook>('/webhooks', request);
  }

  async listWebhooks(): Promise<APIResponse<ListWebhooksResponse>> {
    return this.get<ListWebhooksResponse>('/webhooks');
  }

  async getWebhook(webhookId: string): Promise<APIResponse<Webhook>> {
    return this.get<Webhook>(`/webhooks/${webhookId}`);
  }

  async deleteWebhook(webhookId: string): Promise<APIResponse<void>> {
    return this.delete<void>(`/webhooks/${webhookId}`);
  }

  async updateWebhook(webhookId: string, request: Partial<CreateWebhookRequest>): Promise<APIResponse<Webhook>> {
    return this.patch<Webhook>(`/webhooks/${webhookId}`, request);
  }
}