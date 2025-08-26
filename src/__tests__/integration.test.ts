import { Synthesia } from '../synthesia';

describe('Integration Tests', () => {
  describe('SDK Construction', () => {
    it('should create SDK instance with all APIs', () => {
      const synthesia = new Synthesia({
        apiKey: 'test-key',
      });

      expect(synthesia).toBeDefined();
      expect(synthesia.videos).toBeDefined();
      expect(synthesia.templates).toBeDefined();
      expect(synthesia.webhooks).toBeDefined();
      expect(synthesia.uploads).toBeDefined();
    });

    it('should support custom baseURL', () => {
      const synthesia = new Synthesia({
        apiKey: 'test-key',
        baseURL: 'https://custom.api.com',
      });

      expect(synthesia).toBeDefined();
    });
  });

  describe('Type Exports', () => {
    it('should export all necessary types', () => {
      expect(() => {
        const config = {
          apiKey: 'test',
        };
        new Synthesia(config);
      }).not.toThrow();
    });
  });
});