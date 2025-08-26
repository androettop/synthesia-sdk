import { SynthesiaClient } from './client';
import {
  Template,
  ListTemplatesRequest,
  ListTemplatesResponse,
  APIResponse,
} from './types';

export class TemplatesAPI extends SynthesiaClient {
  async listTemplates(request?: ListTemplatesRequest): Promise<APIResponse<ListTemplatesResponse>> {
    const params: any = {};
    
    if (request?.source) params.source = request.source;
    if (request?.offset) params.offset = request.offset;
    if (request?.limit) params.limit = request.limit;

    return this.get<ListTemplatesResponse>('/templates', params);
  }

  async getTemplate(templateId: string): Promise<APIResponse<Template>> {
    return this.get<Template>(`/templates/${templateId}`);
  }

  async getSynthesiaTemplates(): Promise<APIResponse<ListTemplatesResponse>> {
    return this.listTemplates({ source: 'synthesia' });
  }

  async getWorkspaceTemplates(): Promise<APIResponse<ListTemplatesResponse>> {
    return this.listTemplates({ source: 'workspace' });
  }
}