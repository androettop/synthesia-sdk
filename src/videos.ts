import { SynthesiaClient } from './client';
import {
  CreateVideoRequest,
  CreateVideoFromTemplateRequest,
  Video,
  ListVideosRequest,
  ListVideosResponse,
  UpdateVideoRequest,
  GetXLIFFRequest,
  UploadXLIFFRequest,
  TranslatedVideoResponse,
  APIResponse,
} from './types';

export class VideosAPI extends SynthesiaClient {
  async createVideo(request: CreateVideoRequest): Promise<APIResponse<Video>> {
    return this.post<Video>('/videos', request);
  }

  async listVideos(request?: ListVideosRequest): Promise<APIResponse<ListVideosResponse>> {
    const params: any = {};
    
    if (request?.source) params.source = request.source;
    if (request?.offset) params.offset = request.offset;
    if (request?.limit) params.limit = request.limit;

    return this.get<ListVideosResponse>('/videos', params);
  }

  async getVideo(videoId: string): Promise<APIResponse<Video>> {
    return this.get<Video>(`/videos/${videoId}`);
  }

  async updateVideo(videoId: string, request: UpdateVideoRequest): Promise<APIResponse<Video>> {
    return this.patch<Video>(`/videos/${videoId}`, request);
  }

  async deleteVideo(videoId: string): Promise<APIResponse<void>> {
    return this.delete<void>(`/videos/${videoId}`);
  }

  async createVideoFromTemplate(
    templateId: string,
    data: Record<string, any>,
    options?: Partial<CreateVideoFromTemplateRequest>
  ): Promise<APIResponse<Video>> {
    const request: CreateVideoFromTemplateRequest = {
      templateId,
      templateData: data,
      title: options?.title || 'Video from Template',
      visibility: options?.visibility || 'private',
      ...options,
    };

    return this.post<Video>('/videos/fromTemplate', request);
  }

  async getVideoXLIFF(videoId: string, options?: GetXLIFFRequest): Promise<APIResponse<string>> {
    const params: any = {};
    
    if (options?.videoVersion) params.videoVersion = options.videoVersion;
    if (options?.xliffVersion) params.xliffVersion = options.xliffVersion;

    return this.get<string>(`/videos/${videoId}/xliff`, params);
  }

  async uploadXLIFFTranslation(request: UploadXLIFFRequest): Promise<APIResponse<TranslatedVideoResponse>> {
    return this.post<TranslatedVideoResponse>('/translate/manual', request);
  }
}