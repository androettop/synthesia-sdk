import { VideosAPI } from '../videos';
import { CreateVideoRequest, Video, ListVideosResponse } from '../types';

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

describe('VideosAPI', () => {
  let videosAPI: VideosAPI;
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

    videosAPI = new VideosAPI({
      apiKey: 'test-api-key',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVideo', () => {
    it('should create a video successfully', async () => {
      const mockVideo: Video = {
        id: 'video-123',
        title: 'Test Video',
        status: 'in_progress',
        visibility: 'private',
        createdAt: 1672531200,
        lastUpdatedAt: 1672531200,
      };

      const createRequest: CreateVideoRequest = {
        input: [{
          scriptText: 'Hello world',
          avatar: 'anna_costume1_cameraA', 
          background: 'green_screen',
        }],
        title: 'Test Video',
        visibility: 'private',
        aspectRatio: '16:9',
      };

      mockRequest.mockResolvedValue({
        data: mockVideo,
      });

      const result = await videosAPI.createVideo(createRequest);

      expect(result.data).toEqual(mockVideo);
      expect(result.error).toBeUndefined();
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/videos',
        data: createRequest,
        params: undefined,
      });
    });

    it('should handle errors when creating a video', async () => {
      const createRequest: CreateVideoRequest = {
        input: [{
          scriptText: 'Hello world',
          avatar: 'anna_costume1_cameraA',
          background: 'green_screen',
        }],
        title: 'Test Video',
        visibility: 'private',
        aspectRatio: '16:9',
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid request',
            code: 'BAD_REQUEST',
          },
        },
        message: 'Request failed',
      };

      mockRequest.mockRejectedValue(mockError);

      const result = await videosAPI.createVideo(createRequest);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Request failed');
    });
  });

  describe('listVideos', () => {
    it('should list videos successfully', async () => {
      const mockResponse: ListVideosResponse = {
        videos: [
          {
            id: 'video-1',
            title: 'Video 1',
            status: 'complete',
            visibility: 'private',
            createdAt: 1672531200,
            lastUpdatedAt: 1672531200,
          },
        ],
        nextOffset: 1,
      };

      mockRequest.mockResolvedValue({
        data: mockResponse,
      });

      const result = await videosAPI.listVideos();

      expect(result.data).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/videos',
        data: undefined,
        params: {},
      });
    });
  });

  describe('getVideo', () => {
    it('should get a video by ID', async () => {
      const mockVideo: Video = {
        id: 'video-123',
        title: 'Test Video',
        status: 'complete',
        visibility: 'private',
        createdAt: 1672531200,
        lastUpdatedAt: 1672531200,
        download: 'https://example.com/video.mp4',
      };

      mockRequest.mockResolvedValue({
        data: mockVideo,
      });

      const result = await videosAPI.getVideo('video-123');

      expect(result.data).toEqual(mockVideo);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/videos/video-123',
        data: undefined,
        params: undefined,
      });
    });
  });

  describe('createVideoFromTemplate', () => {
    it('should create a video from template', async () => {
      const mockVideo: Video = {
        id: 'video-123',
        title: 'Video from Template',
        status: 'in_progress',
        visibility: 'private',
        createdAt: 1672531200,
        lastUpdatedAt: 1672531200,
      };

      mockRequest.mockResolvedValue({
        data: mockVideo,
      });

      const result = await videosAPI.createVideoFromTemplate(
        'template-123',
        { name: 'John' },
        { title: 'Custom Title' }
      );

      expect(result.data).toEqual(mockVideo);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/videos/fromTemplate',
        data: {
          templateId: 'template-123',
          templateData: { name: 'John' },
          title: 'Custom Title',
          visibility: 'private',
        },
        params: undefined,
      });
    });
  });

  describe('getVideoXLIFF', () => {
    it('should get XLIFF content for a video', async () => {
      const mockXLIFF = '<?xml version="1.0"?>\n<xliff version="1.2">\n  <file source-language="en" target-language="es">\n    <body>\n      <trans-unit id="1">\n        <source>Hello world</source>\n      </trans-unit>\n    </body>\n  </file>\n</xliff>';

      mockRequest.mockResolvedValue({
        data: mockXLIFF,
      });

      const result = await videosAPI.getVideoXLIFF('video-123', {
        videoVersion: 1,
        xliffVersion: '1.2'
      });

      expect(result.data).toEqual(mockXLIFF);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/videos/video-123/xliff',
        data: undefined,
        params: { videoVersion: 1, xliffVersion: '1.2' },
      });
    });
  });

  describe('uploadXLIFFTranslation', () => {
    it('should upload XLIFF translation', async () => {
      const mockResponse = {
        translatedVideoId: 'translated-video-123',
        message: 'Translation uploaded successfully'
      };

      mockRequest.mockResolvedValue({
        data: mockResponse,
      });

      const result = await videosAPI.uploadXLIFFTranslation({
        videoId: 'video-123',
        xliffContent: '<?xml version="1.0"?>',
        callbackId: 'translation-123'
      });

      expect(result.data).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/translate/manual',
        data: {
          videoId: 'video-123',
          xliffContent: '<?xml version="1.0"?>',
          callbackId: 'translation-123'
        },
        params: undefined,
      });
    });
  });

  describe('deleteVideo', () => {
    it('should delete a video successfully', async () => {
      mockRequest.mockResolvedValue({
        data: null,
      });

      const result = await videosAPI.deleteVideo('video-123');

      expect(result.data).toBeNull();
      expect(result.error).toBeUndefined();
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/videos/video-123',
        data: undefined,
        params: undefined,
      });
    });

    it('should handle errors when deleting a video', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            message: 'Video not found',
            code: 'NOT_FOUND',
          },
        },
        message: 'Not Found',
      };

      mockRequest.mockRejectedValue(mockError);

      const result = await videosAPI.deleteVideo('non-existent-video');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Not Found');
    });
  });
});