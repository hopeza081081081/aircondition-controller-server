/**
 * Logger Utility
 * Provides structured logging with timestamps and log levels
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type LogContext = Record<string, any>;
export interface LoggerOptions {
    level?: LogLevel;
}
export declare class Logger {
    private levels;
    private currentLevel;
    constructor();
    /**
     * Format timestamp
     * @private
     */
    private _getTimestamp;
    /**
     * Format log message
     * @private
     * @param {LogLevel} level - Log level
     * @param {string} message - Log message
     * @param {LogContext} context - Additional context
     */
    private _format;
    /**
     * Log debug message
     * @param {string} message - Message to log
     * @param {LogContext} context - Additional context
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Log info message
     * @param {string} message - Message to log
     * @param {LogContext} context - Additional context
     */
    info(message: string, context?: LogContext): void;
    /**
     * Log warning message
     * @param {string} message - Message to log
     * @param {LogContext} context - Additional context
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Log error message
     * @param {string} message - Message to log
     * @param {Error} error - Error object
     * @param {LogContext} context - Additional context
     */
    error(message: string, error?: Error, context?: LogContext): void;
    /**
     * Set log level
     * @param {LogLevel} level - Log level (DEBUG, INFO, WARN, ERROR)
     */
    setLevel(level: LogLevel): void;
}
declare const logger: Logger;
export default logger;
//# sourceMappingURL=Logger.d.ts.map