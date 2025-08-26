import { SynthesiaUtils } from '../utils';

describe('SynthesiaUtils', () => {
  describe('validateWebhookSignature', () => {
    it('should validate correct webhook signature', () => {
      const payload = '{"event":"video.complete","video":{"id":"123"}}';
      const secret = 'test-secret';
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      const signature = `sha256=${expectedSignature}`;

      const isValid = SynthesiaUtils.validateWebhookSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const payload = '{"event":"video.complete","video":{"id":"123"}}';
      const secret = 'test-secret';
      const signature = 'sha256=invalid-signature';

      const isValid = SynthesiaUtils.validateWebhookSignature(payload, signature, secret);
      expect(isValid).toBe(false);
    });
  });

  describe('isValidWebhookEvent', () => {
    it('should validate correct webhook events', () => {
      expect(SynthesiaUtils.isValidWebhookEvent('video.created')).toBe(true);
      expect(SynthesiaUtils.isValidWebhookEvent('video.complete')).toBe(true);
      expect(SynthesiaUtils.isValidWebhookEvent('video.failed')).toBe(true);
    });

    it('should reject invalid webhook events', () => {
      expect(SynthesiaUtils.isValidWebhookEvent('invalid.event')).toBe(false);
      expect(SynthesiaUtils.isValidWebhookEvent('video.unknown')).toBe(false);
    });
  });

  describe('video status helpers', () => {
    it('should correctly identify video processing status', () => {
      expect(SynthesiaUtils.isVideoProcessing('in_progress')).toBe(true);
      expect(SynthesiaUtils.isVideoProcessing('complete')).toBe(false);
      expect(SynthesiaUtils.isVideoProcessing('failed')).toBe(false);
    });

    it('should correctly identify video complete status', () => {
      expect(SynthesiaUtils.isVideoComplete('complete')).toBe(true);
      expect(SynthesiaUtils.isVideoComplete('in_progress')).toBe(false);
      expect(SynthesiaUtils.isVideoComplete('failed')).toBe(false);
    });

    it('should correctly identify video failed status', () => {
      expect(SynthesiaUtils.isVideoFailed('failed')).toBe(true);
      expect(SynthesiaUtils.isVideoFailed('complete')).toBe(false);
      expect(SynthesiaUtils.isVideoFailed('in_progress')).toBe(false);
    });
  });

  describe('error helpers', () => {
    it('should identify rate limited errors', () => {
      const error = { message: 'Rate limited', statusCode: 429 };
      expect(SynthesiaUtils.isRateLimited(error)).toBe(true);
      
      const nonRateLimitError = { message: 'Bad request', statusCode: 400 };
      expect(SynthesiaUtils.isRateLimited(nonRateLimitError)).toBe(false);
    });

    it('should identify authentication errors', () => {
      const error401 = { message: 'Unauthorized', statusCode: 401 };
      const error403 = { message: 'Forbidden', statusCode: 403 };
      const error400 = { message: 'Bad request', statusCode: 400 };

      expect(SynthesiaUtils.isAuthenticationError(error401)).toBe(true);
      expect(SynthesiaUtils.isAuthenticationError(error403)).toBe(true);
      expect(SynthesiaUtils.isAuthenticationError(error400)).toBe(false);
    });

    it('should identify validation errors', () => {
      const error400 = { message: 'Validation failed', statusCode: 400 };
      const error500 = { message: 'Server error', statusCode: 500 };

      expect(SynthesiaUtils.isValidationError(error400)).toBe(true);
      expect(SynthesiaUtils.isValidationError(error500)).toBe(false);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff delay', () => {
      expect(SynthesiaUtils.calculateRetryDelay(0)).toBe(1000);
      expect(SynthesiaUtils.calculateRetryDelay(1)).toBe(2000);
      expect(SynthesiaUtils.calculateRetryDelay(2)).toBe(4000);
      expect(SynthesiaUtils.calculateRetryDelay(3)).toBe(8000);
    });

    it('should use custom base delay', () => {
      expect(SynthesiaUtils.calculateRetryDelay(0, 500)).toBe(500);
      expect(SynthesiaUtils.calculateRetryDelay(1, 500)).toBe(1000);
      expect(SynthesiaUtils.calculateRetryDelay(2, 500)).toBe(2000);
    });
  });

  describe('sleep', () => {
    it('should sleep for specified duration', async () => {
      const start = Date.now();
      await SynthesiaUtils.sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(95); // Allow some tolerance
      expect(elapsed).toBeLessThan(150);
    });
  });
});