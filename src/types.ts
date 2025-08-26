export interface SynthesiaConfig {
  apiKey: string;
  baseURL?: string;
}

export interface CreateVideoRequest {
  input: VideoInput[];
  title: string;
  description?: string;
  visibility: 'public' | 'private';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5' | '5:4';
  test?: boolean;
  ctaSettings?: CTASettings;
  callbackId?: string;
  soundtrack?: 'corporate' | 'inspirational' | 'modern' | 'urban';
}

export interface VideoInput {
  scriptText?: string;
  scriptAudio?: string;
  scriptLanguage?: string;
  avatar: string;
  background: string;
  avatarSettings?: AvatarSettings;
  backgroundSettings?: BackgroundSettings;
}

export interface AvatarSettings {
  voice?: string;
  horizontalAlign?: 'left' | 'center' | 'right';
  scale?: number;
  style?: 'rectangular' | 'circular';
  backgroundColor?: string;
  seamless?: boolean;
}

export interface BackgroundSettings {
  videoSettings?: {
    shortBackgroundContentMatchMode?: 'freeze' | 'loop' | 'slow_down';
    longBackgroundContentMatchMode?: 'trim' | 'speed_up';
  };
}

export interface TemplateConfig {
  id: string;
  data: Record<string, any>;
}

export interface CTASettings {
  label: string;
  url: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  status: 'in_progress' | 'complete' | 'failed' | 'error' | 'rejected';
  visibility: 'public' | 'private';
  createdAt: number;
  lastUpdatedAt: number;
  download?: string;
  thumbnail?: {
    image?: string;
    gif?: string;
  } | string;
  captions?: {
    srt: string;
    vtt: string;
  };
  duration?: string;
  ctaSettings?: CTASettings;
  callbackId?: string;
}

export interface ListVideosResponse {
  videos: Video[];
  nextOffset?: number;
}

export interface ListVideosRequest {
  source?: 'workspace' | 'my_videos' | 'shared_with_me';
  offset?: number;
  limit?: number;
}

export interface Template {
  id: string;
  title: string;
  description?: string;
  variables: any[];
  createdAt: number;
  lastUpdatedAt: number;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'image' | 'video' | 'avatar';
  required: boolean;
  description?: string;
}

export interface ListTemplatesResponse {
  templates: Template[];
  nextOffset?: number;
}

export interface ListTemplatesRequest {
  source?: 'synthesia' | 'workspace';
  offset?: number;
  limit?: number;
}

export interface Webhook {
  id: string;
  url: string;
  status: 'active' | 'inactive';
  secret?: string;
  createdAt: number;
  lastUpdatedAt: number;
}

export type WebhookEvent = 'video.completed' | 'video.failed';

export interface CreateWebhookRequest {
  url: string;
  events: WebhookEvent[];
}

export interface ListWebhooksResponse {
  webhooks: Webhook[];
}

export interface ListWebhooksRequest {
  limit?: number;
  offset?: number;
  deleted?: boolean;
}

export interface UpdateVideoRequest {
  title?: string;
  description?: string;
  visibility?: 'public' | 'private';
  ctaSettings?: CTASettings;
}

export interface CreateVideoFromTemplateRequest {
  templateId: string;
  templateData: Record<string, any>;
  title?: string;
  description?: string;
  visibility?: 'public' | 'private';
  callbackId?: string;
  ctaSettings?: CTASettings;
  test?: boolean;
}

export interface GetXLIFFRequest {
  videoVersion?: number;
  xliffVersion?: '1.2';
}

export interface UploadXLIFFRequest {
  videoId: string;
  xliffContent: string;
  callbackId?: string;
}

export interface TranslatedVideoResponse {
  translatedVideoId: string;
  message: string;
}

export interface UploadAssetRequest {
  file: Buffer | Blob;
  contentType: string;
}

export interface Asset {
  id: string;
  title?: string;
}

export interface ScriptAudioAsset {
  id: string;
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