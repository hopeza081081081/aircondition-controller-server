/**
 * Person Detection State
 * Manages person detection logic state
 */

import { PersonDetectionMessage } from '../types';
const Logger = require('../utils/Logger');

class PersonDetectionState {
  public isPersonDetected: boolean;
  public shutdownTimer: NodeJS.Timeout | null;
  private detectionMessages: [PersonDetectionMessage, PersonDetectionMessage];

  constructor() {
    this.isPersonDetected = false;
    this.shutdownTimer = null;
    this.detectionMessages = [
      { isPerson: false, prob: 0.0 },  // RPI1
      { isPerson: false, prob: 0.0 }   // RPI2
    ];
    Logger.info('PersonDetectionState initialized');
  }

  /**
   * Update detection message from RPI
   * @param {number} rpiId - RPI ID (0 or 1)
   * @param {PersonDetectionMessage} message - Detection message {isPerson, prob}
   */
  public updateDetection(rpiId: number, message: PersonDetectionMessage): void {
    if (rpiId < 0 || rpiId >= this.detectionMessages.length) {
      Logger.warn(`Invalid RPI ID: ${rpiId}`);
      return;
    }

    this.detectionMessages[rpiId] = message;
    Logger.debug(`RPI${rpiId + 1} detection updated`, message);
  }

  /**
   * Get detection message for specific RPI
   * @param {number} rpiId - RPI ID (0 or 1)
   * @returns {PersonDetectionMessage} Detection message
   */
  public getDetectionMessage(rpiId: number): PersonDetectionMessage {
    if (rpiId < 0 || rpiId >= this.detectionMessages.length) {
      return { isPerson: false, prob: 0.0 };
    }
    return this.detectionMessages[rpiId];
  }

  /**
   * Check if person is detected by any RPI
   * @returns {boolean} True if any RPI detected a person
   */
  public isPersonDetectedByAny(): boolean {
    return this.detectionMessages.some(msg => msg.isPerson === true);
  }

  /**
   * Get current person detection state
   * @returns {boolean} Current detection state
   */
  public getCurrentState(): boolean {
    return this.isPersonDetected;
  }

  /**
   * Set person detection state
   * @param {boolean} state - New detection state
   */
  public setState(state: boolean): void {
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
  public startShutdownTimer(callback: () => void, duration: number): void {
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
  public clearShutdownTimer(): void {
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
  public isTimerActive(): boolean {
    return this.shutdownTimer !== null;
  }
}

export default PersonDetectionState;
