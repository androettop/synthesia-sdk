import { SynthesiaClient } from './client';
import {
  UploadAssetRequest,
  Asset,
  APIResponse,
} from './types';

export class UploadsAPI extends SynthesiaClient {
  async uploadAsset(request: UploadAssetRequest): Promise<APIResponse<Asset>> {
    const formData = new FormData();
    formData.append('file', request.file as Blob, request.filename);
    formData.append('type', request.type);

    try {
      const response = await this.request<Asset>('POST', '/uploads/assets', formData);
      return response;
    } catch (error) {
      return {
        error: error as any,
      };
    }
  }

  async uploadScriptAudio(audioFile: Buffer | Blob, filename: string): Promise<APIResponse<Asset>> {
    return this.uploadAsset({
      file: audioFile,
      filename,
      type: 'audio',
    });
  }

  async uploadImage(imageFile: Buffer | Blob, filename: string): Promise<APIResponse<Asset>> {
    return this.uploadAsset({
      file: imageFile,
      filename,
      type: 'image',
    });
  }

  async uploadVideo(videoFile: Buffer | Blob, filename: string): Promise<APIResponse<Asset>> {
    return this.uploadAsset({
      file: videoFile,
      filename,
      type: 'video',
    });
  }

  async getAsset(assetId: string): Promise<APIResponse<Asset>> {
    return this.get<Asset>(`/uploads/assets/${assetId}`);
  }

  async deleteAsset(assetId: string): Promise<APIResponse<void>> {
    return this.delete<void>(`/uploads/assets/${assetId}`);
  }
}