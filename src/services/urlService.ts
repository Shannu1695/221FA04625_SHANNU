import { ShortenedUrl, UrlSubmission, ClickData } from '../types';
import { logger } from './loggingService';

class UrlService {
  private urls: ShortenedUrl[] = [];
  private readonly STORAGE_KEY = 'shortened_urls';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.urls = parsed.map((url: any) => ({
          ...url,
          createdAt: new Date(url.createdAt),
          expiresAt: new Date(url.expiresAt),
          clicks: url.clicks.map((click: any) => ({
            ...click,
            timestamp: new Date(click.timestamp)
          }))
        }));
        logger.info('Loaded URLs from storage', { count: this.urls.length });
      }
    } catch (error) {
      logger.error('Failed to load URLs from storage', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.urls));
      logger.info('Saved URLs to storage', { count: this.urls.length });
    } catch (error) {
      logger.error('Failed to save URLs to storage', error);
    }
  }

  private generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private isShortCodeUnique(shortCode: string): boolean {
    return !this.urls.some(url => url.shortCode === shortCode);
  }

  private validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private validateShortCode(shortCode: string): boolean {
    const regex = /^[a-zA-Z0-9]{3,10}$/;
    return regex.test(shortCode);
  }

  async createShortenedUrls(submissions: UrlSubmission[]): Promise<ShortenedUrl[]> {
    logger.info('Creating shortened URLs', { count: submissions.length });
    
    if (submissions.length > 5) {
      const error = 'Cannot create more than 5 URLs at once';
      logger.error(error);
      throw new Error(error);
    }

    const results: ShortenedUrl[] = [];

    for (const submission of submissions) {
      try {
        // Validate original URL
        if (!this.validateUrl(submission.originalUrl)) {
          throw new Error('Invalid URL format');
        }

        // Determine short code
        let shortCode = submission.customShortcode;
        if (shortCode) {
          if (!this.validateShortCode(shortCode)) {
            throw new Error('Invalid shortcode format. Use 3-10 alphanumeric characters.');
          }
          if (!this.isShortCodeUnique(shortCode)) {
            throw new Error('Shortcode already exists. Please choose a different one.');
          }
        } else {
          do {
            shortCode = this.generateShortCode();
          } while (!this.isShortCodeUnique(shortCode));
        }

        // Calculate expiry
        const validityMinutes = submission.validityMinutes || 30;
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + validityMinutes * 60 * 1000);

        const shortenedUrl: ShortenedUrl = {
          id: crypto.randomUUID(),
          originalUrl: submission.originalUrl,
          shortCode,
          createdAt,
          expiresAt,
          clicks: []
        };

        this.urls.push(shortenedUrl);
        results.push(shortenedUrl);
        
        logger.info('Created shortened URL', { 
          shortCode, 
          originalUrl: submission.originalUrl,
          expiresAt: expiresAt.toISOString()
        });
      } catch (error) {
        logger.error('Failed to create shortened URL', { 
          originalUrl: submission.originalUrl,
          error: error instanceof Error ? error.message : error
        });
        throw error;
      }
    }

    this.saveToStorage();
    return results;
  }

  getUrlByShortCode(shortCode: string): ShortenedUrl | null {
    const url = this.urls.find(url => url.shortCode === shortCode);
    
    if (!url) {
      logger.warn('Short code not found', { shortCode });
      return null;
    }

    if (url.expiresAt < new Date()) {
      logger.warn('Short URL expired', { shortCode, expiresAt: url.expiresAt });
      return null;
    }

    return url;
  }

  async redirectToUrl(shortCode: string, source: string = 'direct'): Promise<string> {
    logger.info('Redirect attempt', { shortCode, source });
    
    const url = this.getUrlByShortCode(shortCode);
    if (!url) {
      const error = 'URL not found or expired';
      logger.error(error, { shortCode });
      throw new Error(error);
    }

    // Track click
    const clickData: ClickData = {
      timestamp: new Date(),
      source,
      location: await this.getLocationInfo(),
      userAgent: navigator.userAgent
    };

    url.clicks.push(clickData);
    this.saveToStorage();

    logger.info('Successful redirect', { 
      shortCode, 
      originalUrl: url.originalUrl,
      totalClicks: url.clicks.length 
    });

    return url.originalUrl;
  }

  private async getLocationInfo(): Promise<string> {
    try {
      // Using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
    } catch (error) {
      logger.warn('Failed to get location info', error);
      return 'Unknown Location';
    }
  }

  getAllUrls(): ShortenedUrl[] {
    return [...this.urls].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getActiveUrls(): ShortenedUrl[] {
    const now = new Date();
    return this.urls.filter(url => url.expiresAt > now);
  }

  deleteUrl(id: string): void {
    const initialLength = this.urls.length;
    this.urls = this.urls.filter(url => url.id !== id);
    
    if (this.urls.length < initialLength) {
      logger.info('Deleted URL', { id });
      this.saveToStorage();
    } else {
      logger.warn('URL not found for deletion', { id });
    }
  }
}

export const urlService = new UrlService();