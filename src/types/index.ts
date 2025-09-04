export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  expiresAt: Date;
  clicks: ClickData[];
}

export interface ClickData {
  timestamp: Date;
  source: string;
  location: string;
  userAgent: string;
}

export interface UrlSubmission {
  originalUrl: string;
  validityMinutes?: number;
  customShortcode?: string;
}

export interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  data?: any;
}