/**
 * Person Detection State
 * Manages person detection logic state
 */
import { PersonDetectionMessage } from '../types';
declare class PersonDetectionState {
    isPersonDetected: boolean;
    shutdownTimer: NodeJS.Timeout | null;
    private detectionMessages;
    constructor(initialRpiCount?: number);
    /**
     * Ensure detection array is large enough for the given RPI ID
     * @private
     * @param rpiId - RPI ID to accommodate
     */
    private _ensureCapacity;
    /**
     * Update detection message from RPI
     * @param {number} rpiId - RPI ID (0, 1, 2, etc.)
     * @param {PersonDetectionMessage} message - Detection message {isPerson, prob}
     */
    updateDetection(rpiId: number, message: PersonDetectionMessage): void;
    /**
     * Get detection message for specific RPI
     * @param {number} rpiId - RPI ID (0, 1, 2, etc.)
     * @returns {PersonDetectionMessage} Detection message
     */
    getDetectionMessage(rpiId: number): PersonDetectionMessage;
    /**
     * Check if person is detected by any RPI
     * @returns {boolean} True if any RPI detected a person
     */
    isPersonDetectedByAny(): boolean;
    /**
     * Get current person detection state
     * @returns {boolean} Current detection state
     */
    getCurrentState(): boolean;
    /**
     * Set person detection state
     * @param {boolean} state - New detection state
     */
    setState(state: boolean): void;
    /**
     * Start shutdown timer
     * @param {Function} callback - Callback to execute when timer expires
     * @param {number} duration - Timer duration in milliseconds
     */
    startShutdownTimer(callback: () => void, duration: number): void;
    /**
     * Clear shutdown timer
     */
    clearShutdownTimer(): void;
    /**
     * Check if shutdown timer is active
     * @returns {boolean} True if timer is active
     */
    isTimerActive(): boolean;
    /**
     * Get current number of active RPIs
     * @returns {number} Number of active RPIs
     */
    getActiveRpiCount(): number;
    /**
     * Get all detection messages
     * @returns {PersonDetectionMessage[]} Array of all detection messages
     */
    getAllDetectionMessages(): PersonDetectionMessage[];
}
export default PersonDetectionState;
//# sourceMappingURL=PersonDetectionState.d.ts.map