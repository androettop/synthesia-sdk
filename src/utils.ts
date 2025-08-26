import { WebhookEvent, SynthesiaError } from './types';

export class SynthesiaUtils {
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
  }

  static isValidWebhookEvent(event: string): event is WebhookEvent {
    const validEvents: WebhookEvent[] = ['video.completed', 'video.failed'];
    return validEvents.includes(event as WebhookEvent);
  }

  static isVideoProcessing(status: string): boolean {
    return status === 'in_progress';
  }

  static isVideoComplete(status: string): boolean {
    return status === 'complete';
  }

  static isVideoFailed(status: string): boolean {
    return status === 'failed';
  }

  static formatErrorMessage(error: SynthesiaError): string {
    if (error.code) {
      return `${error.code}: ${error.message}`;
    }
    return error.message;
  }

  static isRateLimited(error: SynthesiaError): boolean {
    return error.statusCode === 429;
  }

  static isAuthenticationError(error: SynthesiaError): boolean {
    return error.statusCode === 401 || error.statusCode === 403;  
  }

  static isValidationError(error: SynthesiaError): boolean {
    return error.statusCode === 400;
  }

  static calculateRetryDelay(attempt: number, baseDelay: number = 1000): number {
    return baseDelay * Math.pow(2, attempt);
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async pollVideoStatus(
    getVideo: (id: string) => Promise<{ data?: { status: string } }>,
    videoId: string,
    options: {
      maxAttempts?: number;
      intervalMs?: number;
      onStatusUpdate?: (status: string) => void;
    } = {}
  ): Promise<string> {
    const { 
      maxAttempts = 60, 
      intervalMs = 10000,
      onStatusUpdate 
    } = options;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await getVideo(videoId);
      
      if (!result.data) {
        throw new Error('Failed to get video status');
      }

      const status = result.data.status;
      
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }

      if (status === 'complete' || status === 'failed') {
        return status;
      }

      if (attempt < maxAttempts - 1) {
        await this.sleep(intervalMs);
      }
    }

    throw new Error('Video processing timed out');
  }
}