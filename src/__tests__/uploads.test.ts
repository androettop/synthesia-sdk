import { UploadsAPI } from '../uploads';
import { UploadAssetRequest, Asset, ScriptAudioAsset } from '../types';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    request: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  })),
}));

describe('UploadsAPI', () => {
  let uploadsAPI: UploadsAPI;
  let mockRequest: jest.Mock;

  beforeEach(() => {
    const axios = require('axios');
    mockRequest = jest.fn();
    const mockAxiosInstance = {
      request: mockRequest,
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    };
    axios.create.mockReturnValue(mockAxiosInstance);

    uploadsAPI = new UploadsAPI({
      apiKey: 'test-api-key',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadAsset', () => {
    it('should upload an image asset successfully', async () => {
      const mockAsset: Asset = {
        id: 'user.5dac3bd5-cdb2-4a02-b917-XXXXXX',
        title: 'blue.svg',
      };

      const uploadRequest: UploadAssetRequest = {
        file: Buffer.from('fake image data'),
        contentType: 'image/svg+xml',
      };

      mockRequest.mockResolvedValue({
        data: mockAsset,
      });

      const result = await uploadsAPI.uploadAsset(uploadRequest);

      expect(result.data).toEqual(mockAsset);
      expect(result.error).toBeUndefined();
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/assets',
        data: uploadRequest.file,
        params: undefined,
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      });
    });

    it('should handle invalid content type error', async () => {
      const uploadRequest: UploadAssetRequest = {
        file: Buffer.from('fake image data'),
        contentType: 'image/gif',
      };

      const mockError = {
        response: {
          status: 415,
          data: {
            error: 'Invalid Content-Type header: "image/gif". Expected one of: image/jpeg, image/png, image/svg+xml, video/mp4, video/webm.',
          },
        },
        message: 'Unsupported Media Type',
      };

      mockRequest.mockRejectedValue(mockError);

      const result = await uploadsAPI.uploadAsset(uploadRequest);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    it('should handle missing content type error', async () => {
      const uploadRequest: UploadAssetRequest = {
        file: Buffer.from('fake image data'),
        contentType: '',
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            error: 'Missing Content-Type header',
          },
        },
        message: 'Bad Request',
      };

      mockRequest.mockRejectedValue(mockError);

      const result = await uploadsAPI.uploadAsset(uploadRequest);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('uploadScriptAudio', () => {
    it('should upload script audio successfully', async () => {
      const mockAudio: ScriptAudioAsset = {
        id: 'ac1ea9ed-1337-4969-a9fe-XXXXXX',
      };

      const audioBuffer = Buffer.from('fake mp3 data');

      mockRequest.mockResolvedValue({
        data: mockAudio,
      });

      const result = await uploadsAPI.uploadScriptAudio(audioBuffer);

      expect(result.data).toEqual(mockAudio);
      expect(result.error).toBeUndefined();
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/scriptAudio',
        data: audioBuffer,
        params: undefined,
        headers: {
          'Content-Type': 'audio/mpeg',
        },
      });
    });

    it('should handle authentication error', async () => {
      const audioBuffer = Buffer.from('fake mp3 data');

      const mockError = {
        response: {
          status: 401,
          data: {
            error: 'Missing or invalid Authorization header',
          },
        },
        message: 'Unauthorized',
      };

      mockRequest.mockRejectedValue(mockError);

      const result = await uploadsAPI.uploadScriptAudio(audioBuffer);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    it('should handle unsupported media type error', async () => {
      const audioBuffer = Buffer.from('fake wav data');

      const mockError = {
        response: {
          status: 415,
          data: {
            error: 'Detected WAV file. Unsupported media type.',
          },
        },
        message: 'Unsupported Media Type',
      };

      mockRequest.mockRejectedValue(mockError);

      const result = await uploadsAPI.uploadScriptAudio(audioBuffer);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('uploadImage', () => {
    it('should upload image with correct content type', async () => {
      const mockAsset: Asset = {
        id: 'image-123',
        title: 'test.png',
      };

      const imageBuffer = Buffer.from('fake png data');

      mockRequest.mockResolvedValue({
        data: mockAsset,
      });

      const result = await uploadsAPI.uploadImage(imageBuffer, 'image/png');

      expect(result.data).toEqual(mockAsset);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/assets',
        data: imageBuffer,
        params: undefined,
        headers: {
          'Content-Type': 'image/png',
        },
      });
    });
  });

  describe('uploadVideo', () => {
    it('should upload video with correct content type', async () => {
      const mockAsset: Asset = {
        id: 'video-123',
        title: 'test.mp4',
      };

      const videoBuffer = Buffer.from('fake mp4 data');

      mockRequest.mockResolvedValue({
        data: mockAsset,
      });

      const result = await uploadsAPI.uploadVideo(videoBuffer, 'video/mp4');

      expect(result.data).toEqual(mockAsset);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/assets',
        data: videoBuffer,
        params: undefined,
        headers: {
          'Content-Type': 'video/mp4',
        },
      });
    });
  });
});