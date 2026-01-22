/**
 * Logger Utility
 * Provides structured logging with timestamps and log levels
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type LogContext = Record<string, any>;

export interface LoggerOptions {
  level?: LogLevel;
}

export class Logger {
  private levels: Record<LogLevel, number>;
  private currentLevel: number;

  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
    this.currentLevel = this.levels.INFO;
  }

  /**
   * Format timestamp
   * @private
   */
  private _getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format log message
   * @private
   * @param {LogLevel} level - Log level
   * @param {string} message - Log message
   * @param {LogContext} context - Additional context
   */
  private _format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = this._getTimestamp();
    const logObj: {
      timestamp: string;
      level: LogLevel;
      message: string;
      context?: LogContext;
    } = {
      timestamp,
      level,
      message
    };

    if (context) {
      logObj.context = context;
    }

    return JSON.stringify(logObj);
  }

  /**
   * Log debug message
   * @param {string} message - Message to log
   * @param {LogContext} context - Additional context
   */
  public debug(message: string, context?: LogContext): void {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.log(this._format('DEBUG', message, context));
    }
  }

  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {LogContext} context - Additional context
   */
  public info(message: string, context?: LogContext): void {
    if (this.currentLevel <= this.levels.INFO) {
      console.log(this._format('INFO', message, context));
    }
  }

  /**
   * Log warning message
   * @param {string} message - Message to log
   * @param {LogContext} context - Additional context
   */
  public warn(message: string, context?: LogContext): void {
    if (this.currentLevel <= this.levels.WARN) {
      console.warn(this._format('WARN', message, context));
    }
  }

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {Error} error - Error object
   * @param {LogContext} context - Additional context
   */
  public error(message: string, error?: Error, context?: LogContext): void {
    if (this.currentLevel <= this.levels.ERROR) {
      const errorContext: LogContext = {
        ...context,
        error: error ? {
          message: error.message,
          stack: error.stack
        } : null
      };
      console.error(this._format('ERROR', message, errorContext));
    }
  }

  /**
   * Set log level
   * @param {LogLevel} level - Log level (DEBUG, INFO, WARN, ERROR)
   */
  public setLevel(level: LogLevel): void {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
    }
  }
}

// Export singleton instance
const logger = new Logger();

// Export both for compatibility
module.exports = logger;
export default logger;
