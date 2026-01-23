"use strict";
/**
 * Logger Utility
 * Provides structured logging with timestamps and log levels
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
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
    _getTimestamp() {
        return new Date().toISOString();
    }
    /**
     * Format log message
     * @private
     * @param {LogLevel} level - Log level
     * @param {string} message - Log message
     * @param {LogContext} context - Additional context
     */
    _format(level, message, context) {
        const timestamp = this._getTimestamp();
        const logObj = {
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
    debug(message, context) {
        if (this.currentLevel <= this.levels.DEBUG) {
            console.log(this._format('DEBUG', message, context));
        }
    }
    /**
     * Log info message
     * @param {string} message - Message to log
     * @param {LogContext} context - Additional context
     */
    info(message, context) {
        if (this.currentLevel <= this.levels.INFO) {
            console.log(this._format('INFO', message, context));
        }
    }
    /**
     * Log warning message
     * @param {string} message - Message to log
     * @param {LogContext} context - Additional context
     */
    warn(message, context) {
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
    error(message, error, context) {
        if (this.currentLevel <= this.levels.ERROR) {
            const errorContext = {
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
    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
        }
    }
}
exports.Logger = Logger;
// Export singleton instance
const logger = new Logger();
// Export both for compatibility
module.exports = logger;
exports.default = logger;
//# sourceMappingURL=Logger.js.map