/**
 * Cloud MQTT Service
 * Manages cloud MQTT broker connection for data relay
 * Simplified - uses generic publish method
 */

import { MqttClient } from './MqttClient';
import { MqttConfig } from '../../types';
const Logger = require('../../utils/Logger');

export class CloudMqttService extends MqttClient {
  private initialized: boolean;

  constructor(config: MqttConfig) {
    super(config, 'CloudMQTT');
    this.initialized = false;
  }

  /**
   * Initialize cloud MQTT service (non-blocking)
   * Connection failures won't crash the application
   */
  public async initialize(): Promise<void> {
    try {
      await this.connect();

      // Publish online status
      await this.publishOnlineStatus('true');

      this.initialized = true;
      Logger.info('CloudMQTT - Service initialized successfully');
    } catch (error) {
      Logger.error('CloudMQTT - Initialization failed, but application will continue', error as Error);
      // Don't throw - allow application to continue without cloud MQTT
      this.initialized = false;

      // Try to reconnect in background
      this._startReconnectLoop();
    }
  }

  /**
   * Start background reconnection loop
   * @private
   */
  private _startReconnectLoop(): void {
    const reconnectInterval = setInterval(async () => {
      if (this.isConnected()) {
        clearInterval(reconnectInterval);
        Logger.info('CloudMQTT - Reconnected successfully');
        this.initialized = true;
        return;
      }

      Logger.info('CloudMQTT - Attempting to reconnect...');
      try {
        await this.connect();
        await this.publishOnlineStatus('true');
        this.initialized = true;
        clearInterval(reconnectInterval);
        Logger.info('CloudMQTT - Reconnected and initialized');
      } catch (error) {
        Logger.warn('CloudMQTT - Reconnection attempt failed', error as Error);
      }
    }, 30000); // Try every 30 seconds
  }

  /**
   * Publish online status to cloud
   * @param status - 'true' or 'false'
   */
  public async publishOnlineStatus(status: string): Promise<void> {
    try {
      await this.publish(
        'myFinalProject/server/properties/online',
        status,
        { qos: 2, retain: true }
      );
    } catch (error) {
      Logger.error('CloudMQTT - Failed to publish online status', error as Error);
      // Don't throw - non-critical error
    }
  }

  /**
   * Check if service is initialized
   * @returns True if initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}
