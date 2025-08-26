import { TemplatesAPI } from '../templates';
import { Template, ListTemplatesResponse } from '../types';

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

describe('TemplatesAPI', () => {
  let templatesAPI: TemplatesAPI;
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

    templatesAPI = new TemplatesAPI({
      apiKey: 'test-api-key',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listTemplates', () => {
    it('should list all templates', async () => {
      const mockResponse: ListTemplatesResponse = {
        templates: [
          {
            id: 'template-1',
            title: 'Template 1',
            description: 'A test template',
            variables: [],
            createdAt: 1672531200,
            lastUpdatedAt: 1672531200,
          },
        ],
        nextOffset: 1,
      };

      mockRequest.mockResolvedValue({
        data: mockResponse,
      });

      const result = await templatesAPI.listTemplates();

      expect(result.data).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/templates',
        data: undefined,
        params: {},
      });
    });

    it('should list templates with source filter', async () => {
      const mockResponse: ListTemplatesResponse = {
        templates: [],
        nextOffset: 0,
      };

      mockRequest.mockResolvedValue({
        data: mockResponse,
      });

      const result = await templatesAPI.listTemplates({ source: 'workspace' });

      expect(result.data).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/templates',
        data: undefined,
        params: { source: 'workspace' },
      });
    });
  });

  describe('getTemplate', () => {
    it('should get a template by ID', async () => {
      const mockTemplate: Template = {
        id: 'template-123',
        title: 'Test Template',
        description: 'A test template',
        variables: [],
        createdAt: 1672531200,
        lastUpdatedAt: 1672531200,
      };

      mockRequest.mockResolvedValue({
        data: mockTemplate,
      });

      const result = await templatesAPI.getTemplate('template-123');

      expect(result.data).toEqual(mockTemplate);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/templates/template-123',
        data: undefined,
        params: undefined,
      });
    });
  });

  describe('getSynthesiaTemplates', () => {
    it('should get Synthesia templates', async () => {
      const mockResponse: ListTemplatesResponse = {
        templates: [],
        nextOffset: 0,
      };

      mockRequest.mockResolvedValue({
        data: mockResponse,
      });

      const result = await templatesAPI.getSynthesiaTemplates();

      expect(result.data).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/templates',
        data: undefined,
        params: { source: 'synthesia' },
      });
    });
  });
});