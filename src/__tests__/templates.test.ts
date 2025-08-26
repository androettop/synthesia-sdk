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
    axios.create.mockReturnValue({
      request: mockRequest,
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    });

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
            name: 'Template 1',
            description: 'A test template',
            variables: [
              {
                name: 'name',
                type: 'text',
                required: true,
                description: 'Person name',
              },
            ],
            source: 'synthesia',
          },
        ],
        count: 1,
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
        count: 0,
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
        name: 'Test Template',
        description: 'A test template',
        variables: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
        ],
        source: 'synthesia',
        thumbnailUrl: 'https://example.com/thumb.jpg',
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
        count: 0,
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