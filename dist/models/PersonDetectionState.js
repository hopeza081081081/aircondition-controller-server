"use strict";
/**
 * Person Detection State
 * Manages person detection logic state
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Logger = require('../utils/Logger');
class PersonDetectionState {
    constructor(initialRpiCount = 2) {
        this.isPersonDetected = false;
        this.shutdownTimer = null;
        this.detectionMessages = Array(initialRpiCount).fill(null).map(() => ({
            isPerson: false,
            prob: 0.0
        }));
        Logger.info('PersonDetectionState initialized', { rpiCount: initialRpiCount });
    }
    /**
     * Ensure detection array is large enough for the given RPI ID
     * @private
     * @param rpiId - RPI ID to accommodate
     */
    _ensureCapacity(rpiId) {
        if (rpiId >= this.detectionMessages.length) {
            const oldLength = this.detectionMessages.length;
            // Expand array
            for (let i = this.detectionMessages.length; i <= rpiId; i++) {
                this.detectionMessages.push({ isPerson: false, prob: 0.0 });
            }
            Logger.info(`Detection array expanded from ${oldLength} to ${this.detectionMessages.length}`, {
                newRpiCount: this.detectionMessages.length
            });
        }
    }
    /**
     * Update detection message from RPI
     * @param {number} rpiId - RPI ID (0, 1, 2, etc.)
     * @param {PersonDetectionMessage} message - Detection message {isPerson, prob}
     */
    updateDetection(rpiId, message) {
        if (rpiId < 0) {
            Logger.warn(`Invalid RPI ID: ${rpiId}`);
            return;
        }
        // Auto-expand array if needed
        this._ensureCapacity(rpiId);
        this.detectionMessages[rpiId] = message;
        Logger.debug(`RPI${rpiId + 1} detection updated`, message);
    }
    /**
     * Get detection message for specific RPI
     * @param {number} rpiId - RPI ID (0, 1, 2, etc.)
     * @returns {PersonDetectionMessage} Detection message
     */
    getDetectionMessage(rpiId) {
        if (rpiId < 0 || rpiId >= this.detectionMessages.length) {
            return { isPerson: false, prob: 0.0 };
        }
        return this.detectionMessages[rpiId];
    }
    /**
     * Check if person is detected by any RPI
     * @returns {boolean} True if any RPI detected a person
     */
    isPersonDetectedByAny() {
        return this.detectionMessages.some(msg => msg.isPerson === true);
    }
    /**
     * Get current person detection state
     * @returns {boolean} Current detection state
     */
    getCurrentState() {
        return this.isPersonDetected;
    }
    /**
     * Set person detection state
     * @param {boolean} state - New detection state
     */
    setState(state) {
        const oldState = this.isPersonDetected;
        this.isPersonDetected = state;
        if (oldState !== state) {
            Logger.info(`Person detection state changed: ${oldState} -> ${state}`);
        }
    }
    /**
     * Start shutdown timer
     * @param {Function} callback - Callback to execute when timer expires
     * @param {number} duration - Timer duration in milliseconds
     */
    startShutdownTimer(callback, duration) {
        this.clearShutdownTimer(); // Clear existing timer if any
        this.shutdownTimer = setTimeout(() => {
            Logger.info('Shutdown timer expired, turning off aircons');
            callback();
        }, duration);
        Logger.debug(`Shutdown timer started: ${duration}ms`);
    }
    /**
     * Clear shutdown timer
     */
    clearShutdownTimer() {
        if (this.shutdownTimer) {
            clearTimeout(this.shutdownTimer);
            this.shutdownTimer = null;
            Logger.debug('Shutdown timer cleared');
        }
    }
    /**
     * Check if shutdown timer is active
     * @returns {boolean} True if timer is active
     */
    isTimerActive() {
        return this.shutdownTimer !== null;
    }
    /**
     * Get current number of active RPIs
     * @returns {number} Number of active RPIs
     */
    getActiveRpiCount() {
        return this.detectionMessages.length;
    }
    /**
     * Get all detection messages
     * @returns {PersonDetectionMessage[]} Array of all detection messages
     */
    getAllDetectionMessages() {
        return [...this.detectionMessages];
    }
}
exports.default = PersonDetectionState;
//# sourceMappingURL=PersonDetectionState.js.map