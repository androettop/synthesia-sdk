import { SynthesiaClient } from './client';
import {
  Webhook,
  CreateWebhookRequest,
  ListWebhooksRequest,
  ListWebhooksResponse,
  APIResponse,
} from './types';

export class WebhooksAPI extends SynthesiaClient {
  async createWebhook(request: CreateWebhookRequest): Promise<APIResponse<Webhook>> {
    return this.post<Webhook>('/webhooks', request);
  }

  async listWebhooks(request?: ListWebhooksRequest): Promise<APIResponse<ListWebhooksResponse>> {
    const params: any = {};
    
    if (request?.limit) params.limit = request.limit;
    if (request?.offset) params.offset = request.offset;
    if (request?.deleted !== undefined) params.deleted = request.deleted;

    return this.get<ListWebhooksResponse>('/webhooks', params);
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