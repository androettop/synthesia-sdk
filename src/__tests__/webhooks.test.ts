import { WebhooksAPI } from '../webhooks';
import { Webhook, CreateWebhookRequest, ListWebhooksResponse } from '../types';

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

describe('WebhooksAPI', () => {
  let webhooksAPI: WebhooksAPI;
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

    webhooksAPI = new WebhooksAPI({
      apiKey: 'test-api-key',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWebhook', () => {
    it('should create a webhook successfully', async () => {
      const mockWebhook: Webhook = {
        id: 'webhook-123',
        url: 'https://example.com/webhook',
        status: 'active',
        createdAt: 1672531200,
        lastUpdatedAt: 1672531200,
      };

      const createRequest: CreateWebhookRequest = {
        url: 'https://example.com/webhook',
        events: ['video.completed'],
      };

      mockRequest.mockResolvedValue({
        data: mockWebhook,
      });

      const result = await webhooksAPI.createWebhook(createRequest);

      expect(result.data).toEqual(mockWebhook);
      expect(result.error).toBeUndefined();
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/webhooks',
        data: createRequest,
        params: undefined,
      });
    });
  });

  describe('listWebhooks', () => {
    it('should list webhooks successfully', async () => {
      const mockResponse: ListWebhooksResponse = {
        webhooks: [
          {
            id: 'webhook-1',
            url: 'https://example.com/webhook1',
            status: 'active',
            createdAt: 1672531200,
            lastUpdatedAt: 1672531200,
          },
        ],
      };

      mockRequest.mockResolvedValue({
        data: mockResponse,
      });

      const result = await webhooksAPI.listWebhooks();

      expect(result.data).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/webhooks',
        data: undefined,
        params: {},
      });
    });
  });

  describe('getWebhook', () => {
    it('should get a webhook by ID', async () => {
      const mockWebhook: Webhook = {
        id: 'webhook-123',
        url: 'https://example.com/webhook',
        status: 'active',
        secret: 'webhook-secret',
        createdAt: 1672531200,
        lastUpdatedAt: 1672531200,
      };

      mockRequest.mockResolvedValue({
        data: mockWebhook,
      });

      const result = await webhooksAPI.getWebhook('webhook-123');

      expect(result.data).toEqual(mockWebhook);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/webhooks/webhook-123',
        data: undefined,
        params: undefined,
      });
    });
  });

  describe('deleteWebhook', () => {
    it('should delete a webhook', async () => {
      mockRequest.mockResolvedValue({
        data: null,
      });

      const result = await webhooksAPI.deleteWebhook('webhook-123');

      expect(result.data).toBeNull();
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/webhooks/webhook-123',
        data: undefined,
        params: undefined,
      });
    });
  });
});