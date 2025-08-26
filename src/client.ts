import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  SynthesiaConfig,
  SynthesiaError,
  APIResponse,
  RateLimitInfo,
} from './types';

export class SynthesiaClient {
  private http: AxiosInstance;
  private uploadHttp: AxiosInstance;
  private config: SynthesiaConfig;
  private rateLimitInfo?: RateLimitInfo;

  constructor(config: SynthesiaConfig) {
    this.config = {
      baseURL: 'https://api.synthesia.io/v2',
      ...config,
    };

    this.http = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'Authorization': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.uploadHttp = axios.create({
      baseURL: 'https://upload.api.synthesia.io/v2',
      headers: {
        'Authorization': this.config.apiKey,
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    const responseInterceptor = (response: AxiosResponse) => {
      this.updateRateLimitInfo(response);
      return response;
    };
    const errorInterceptor = (error: AxiosError) => {
      this.updateRateLimitInfo(error.response);
      throw this.handleError(error);
    };

    this.http.interceptors.response.use(responseInterceptor, errorInterceptor);
    this.uploadHttp.interceptors.response.use(responseInterceptor, errorInterceptor);
  }

  private updateRateLimitInfo(response?: AxiosResponse): void {
    if (!response?.headers) return;

    const limit = response.headers['x-ratelimit-limit'];
    const remaining = response.headers['x-ratelimit-remaining'];
    const resetAt = response.headers['x-ratelimit-reset'];

    if (limit && remaining && resetAt) {
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        resetAt: resetAt,
      };
    }
  }

  private handleError(error: AxiosError): SynthesiaError {
    const synthesiaError: SynthesiaError = {
      message: error.message,
      statusCode: error.response?.status || 500,
    };

    if (error.response?.data) {
      const errorData = error.response.data as any;
      synthesiaError.message = errorData.message || errorData.error || error.message;
      synthesiaError.code = errorData.code;
      synthesiaError.details = errorData.details;
    }

    return synthesiaError;
  }

  public getRateLimitInfo(): RateLimitInfo | undefined {
    return this.rateLimitInfo;
  }

  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    options?: { params?: any; headers?: any; uploadApi?: boolean }
  ): Promise<APIResponse<T>> {
    try {
      const client = options?.uploadApi ? this.uploadHttp : this.http;
      const requestConfig: any = {
        method,
        url: endpoint,
        data,
        params: options?.params,
      };

      if (options?.headers) {
        requestConfig.headers = { ...requestConfig.headers, ...options.headers };
      }

      const response = await client.request(requestConfig);

      return {
        data: response.data,
      };
    } catch (error) {
      return {
        error: error as SynthesiaError,
      };
    }
  }

  protected async get<T>(endpoint: string, params?: any): Promise<APIResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, { params });
  }

  protected async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  protected async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }

  protected async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
}