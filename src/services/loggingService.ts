import { LogEntry } from '../types';

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(level: LogEntry['level'], message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    };

    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for development
    const logMethod = level.toLowerCase();
    if (logMethod in console) {
      (console as any)[logMethod](`[${level}] ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  error(message: string, data?: any) {
    this.log('ERROR', message, data);
  }

  debug(message: string, data?: any) {
    this.log('DEBUG', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new LoggingService();