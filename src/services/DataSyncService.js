/**
 * Data Sync Service
 * Manages communication with MongoDB worker thread
 */

const { Worker, MessageChannel } = require('worker_threads');
const Logger = require('../utils/Logger');

class DataSyncService {
  constructor(workerPath) {
    this.workerPath = workerPath;
    this.worker = null;
    this.port1 = null;
    this.port2 = null;
    this.initialized = false;
    Logger.info('DataSyncService initialized', { workerPath });
  }

  /**
   * Initialize data sync service
   */
  initialize() {
    try {
      // Create message channel
      const { port1, port2 } = new MessageChannel();
      this.port1 = port1;
      this.port2 = port2;

      // Create worker thread
      this.worker = new Worker(this.workerPath);

      // Setup port2 to forward messages to worker
      this.port2.on('message', (message) => {
        if (this.worker) {
          this.worker.postMessage(message);
        }
      });

      // Listen for worker messages (optional, for debugging)
      this.worker.on('message', (message) => {
        Logger.debug('Message received from worker', message);
      });

      // Handle worker errors
      this.worker.on('error', (error) => {
        Logger.error('Worker thread error', error);
      });

      // Handle worker exit
      this.worker.on('exit', (code) => {
        if (code !== 0) {
          Logger.error(`Worker stopped with exit code ${code}`);
        }
      });

      this.initialized = true;
      Logger.info('DataSyncService worker thread started');
    } catch (error) {
      Logger.error('Failed to initialize DataSyncService', error);
      throw error;
    }
  }

  /**
   * Send device data to worker thread
   * @param {Object} deviceDataModel - Device data model
   */
  sendData(deviceDataModel) {
    if (!this.initialized || !this.port1) {
      Logger.warn('DataSyncService not initialized, cannot send data');
      return;
    }

    try {
      this.port1.postMessage(deviceDataModel);
      Logger.debug('Data sent to worker thread');
    } catch (error) {
      Logger.error('Failed to send data to worker thread', error);
    }
  }

  /**
   * Stop data sync service
   */
  stop() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      Logger.info('DataSyncService worker thread terminated');
    }

    if (this.port1) {
      this.port1.close();
      this.port1 = null;
    }

    if (this.port2) {
      this.port2.close();
      this.port2 = null;
    }

    this.initialized = false;
  }

  /**
   * Check if service is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }
}

module.exports = DataSyncService;
