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
    axios.create.mockReturnValue({
      request: mockRequest,
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    });

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
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const createRequest: CreateVideoRequest = {
        title: 'Test Video',
        scriptText: 'Hello world',
        avatar: 'anna_costume1_cameraA',
        background: 'green_screen',
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
      });
    });

    it('should handle errors when creating a video', async () => {
      const createRequest: CreateVideoRequest = {
        title: 'Test Video',
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
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        ],
        count: 1,
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
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
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
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
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
        url: '/videos',
        data: {
          title: 'Custom Title',
          template: {
            id: 'template-123',
            data: { name: 'John' },
          },
        },
      });
    });
  });
});