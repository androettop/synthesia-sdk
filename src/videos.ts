import { SynthesiaClient } from './client';
import {
  CreateVideoRequest,
  Video,
  ListVideosRequest,
  ListVideosResponse,
  UpdateVideoRequest,
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
    options?: Partial<CreateVideoRequest>
  ): Promise<APIResponse<Video>> {
    const request: CreateVideoRequest = {
      title: options?.title || 'Video from Template',
      template: {
        id: templateId,
        data,
      },
      ...options,
    };

    return this.createVideo(request);
  }
}