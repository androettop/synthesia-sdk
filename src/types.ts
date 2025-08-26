export interface SynthesiaConfig {
  apiKey: string;
  baseURL?: string;
}

export interface CreateVideoRequest {
  test?: boolean;
  title: string;
  scriptText?: string;
  avatar?: string;
  background?: string;
  scenes?: Scene[];
  template?: TemplateConfig;
  webhookId?: string;
  visibility?: 'public' | 'private';
  ctaSettings?: CTASettings;
}

export interface Scene {
  avatar: string;
  background: string;
  script: string;
  voiceSettings?: VoiceSettings;
}

export interface VoiceSettings {
  speed?: number;
  pitch?: number;
}

export interface TemplateConfig {
  id: string;
  data: Record<string, any>;
}

export interface CTASettings {
  label: string;
  url: string;
  style?: 'button' | 'overlay';
}

export interface Video {
  id: string;
  title: string;
  status: 'in_progress' | 'complete' | 'failed';
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
  download?: string;
  thumbnails?: {
    static: string;
    animated: string;
  };
  captions?: {
    srt: string;
    vtt: string;
  };
  duration?: number;
  ctaSettings?: CTASettings;
}

export interface ListVideosResponse {
  videos: Video[];
  count: number;
  offset?: number;
  limit?: number;
}

export interface ListVideosRequest {
  source?: 'workspace' | 'personal' | 'shared';
  offset?: number;
  limit?: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  variables: TemplateVariable[];
  thumbnailUrl?: string;
  source: 'synthesia' | 'workspace';
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'image' | 'video' | 'avatar';
  required: boolean;
  description?: string;
}

export interface ListTemplatesResponse {
  templates: Template[];
  count: number;
}

export interface ListTemplatesRequest {
  source?: 'synthesia' | 'workspace';
}

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export type WebhookEvent = 'video.created' | 'video.complete' | 'video.failed';

export interface CreateWebhookRequest {
  url: string;
  events: WebhookEvent[];
  secret?: string;
}

export interface ListWebhooksResponse {
  webhooks: Webhook[];
  count: number;
}

export interface UpdateVideoRequest {
  title?: string;
  visibility?: 'public' | 'private';
}

export interface UploadAssetRequest {
  file: Buffer | Blob;
  filename: string;
  type: 'audio' | 'image' | 'video';
}

export interface Asset {
  id: string;
  filename: string;
  type: 'audio' | 'image' | 'video';
  url: string;
  createdAt: string;
  size: number;
}

export interface SynthesiaError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

export interface APIResponse<T> {
  data?: T;
  error?: SynthesiaError;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
}