import { SynthesiaConfig, RateLimitInfo } from './types';
import { VideosAPI } from './videos';
import { TemplatesAPI } from './templates';
import { WebhooksAPI } from './webhooks';
import { UploadsAPI } from './uploads';

export class Synthesia {
  public videos: VideosAPI;
  public templates: TemplatesAPI;
  public webhooks: WebhooksAPI;
  public uploads: UploadsAPI;

  constructor(config: SynthesiaConfig) {
    this.videos = new VideosAPI(config);
    this.templates = new TemplatesAPI(config);
    this.webhooks = new WebhooksAPI(config);
    this.uploads = new UploadsAPI(config);
  }

  getRateLimitInfo(): RateLimitInfo | undefined {
    return this.videos.getRateLimitInfo();
  }
}