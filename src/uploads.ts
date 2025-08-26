import { SynthesiaClient } from './client';
import {
  UploadAssetRequest,
  Asset,
  ScriptAudioAsset,
  APIResponse,
} from './types';

export class UploadsAPI extends SynthesiaClient {
  async uploadAsset(request: UploadAssetRequest): Promise<APIResponse<Asset>> {
    const headers = {
      'Content-Type': request.contentType,
    };

    try {
      const response = await this.request<Asset>('POST', '/assets', request.file, { headers, uploadApi: true });
      return response;
    } catch (error) {
      return {
        error: error as any,
      };
    }
  }

  async uploadScriptAudio(audioFile: Buffer | Blob): Promise<APIResponse<ScriptAudioAsset>> {
    const headers = {
      'Content-Type': 'audio/mpeg',
    };

    try {
      const response = await this.request<ScriptAudioAsset>('POST', '/scriptAudio', audioFile, { headers, uploadApi: true });
      return response;
    } catch (error) {
      return {
        error: error as any,
      };
    }
  }

  async uploadImage(imageFile: Buffer | Blob, contentType: string): Promise<APIResponse<Asset>> {
    return this.uploadAsset({
      file: imageFile,
      contentType,
    });
  }

  async uploadVideo(videoFile: Buffer | Blob, contentType: string): Promise<APIResponse<Asset>> {
    return this.uploadAsset({
      file: videoFile,
      contentType,
    });
  }

}