/**
 * Local MQTT Service
 * Manages local MQTT broker connection
 */

import { MqttClient } from './MqttClient';
import { MqttConfig, SubscriptionConfig } from '../../types';
const Logger = require('../../utils/Logger');

export class LocalMqttService extends MqttClient {
  private initialized: boolean;
  private reconnectInterval: NodeJS.Timeout | null;

  constructor(config: MqttConfig) {
    super(config, 'LocalMQTT');
    this.initialized = false;
    this.reconnectInterval = null;
  }

  /**
   * Initialize local MQTT service (non-blocking)
   * Connection failures won't crash the application
   */
  public async initialize(): Promise<void> {
    try {
      await this.connect();

      // Publish online status
      await this.publishOnlineStatus('true');

      // Initialize aircon controller commands to false
      for (let i = 1; i <= 3; i++) {
        await this.publishCommand(i, 'false');
      }

      this.initialized = true;
      Logger.info('LocalMQTT - Service initialized successfully');
    } catch (error) {
      Logger.error('LocalMQTT - Initialization failed, but application will continue', error as Error);
      // Don't throw - allow application to continue without local MQTT
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
    // Clear existing interval if any (prevent memory leak)
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      Logger.debug('LocalMQTT - Cleared previous reconnect interval');
    }

    this.reconnectInterval = setInterval(async () => {
      if (this.isConnected()) {
        this._clearReconnectInterval();
        Logger.info('LocalMQTT - Reconnected successfully');
        this.initialized = true;
        return;
      }

      Logger.info('LocalMQTT - Attempting to reconnect...');
      try {
        await this.connect();
        await this.publishOnlineStatus('true');
        for (let i = 1; i <= 3; i++) {
          await this.publishCommand(i, 'false');
        }
        this.initialized = true;
        this._clearReconnectInterval();
        Logger.info('LocalMQTT - Reconnected and initialized');
      } catch (error) {
        Logger.warn('LocalMQTT - Reconnection attempt failed', error as Error);
      }
    }, 30000); // Try every 30 seconds

    Logger.debug('LocalMQTT - Reconnect loop started');
  }

  /**
   * Clear reconnect interval
   * @private
   */
  private _clearReconnectInterval(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
      Logger.debug('LocalMQTT - Reconnect interval cleared');
    }
  }

  /**
   * Disconnect and cleanup
   */
  public disconnect(): void {
    this._clearReconnectInterval();
    super.disconnect();
    Logger.info('LocalMQTT - Disconnected and cleaned up');
  }

  /**
   * Publish server online status
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
      Logger.error('LocalMQTT - Failed to publish online status', error as Error);
      // Don't throw - non-critical error
    }
  }

  /**
   * Publish command to aircon controller with retry
   * @param controllerId - Controller ID (1, 2, or 3)
   * @param command - Command ('true' or 'false')
   */
  public async publishCommand(controllerId: number, command: string): Promise<void> {
    const topic = `myFinalProject/server/electricalAppliances/airconController${controllerId}/command`;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.publish(topic, command, { qos: 2, retain: true });
        Logger.debug(`LocalMQTT - Command sent to controller ${controllerId}: ${command}`);
        return;
      } catch (error) {
        Logger.warn(`LocalMQTT - Publish attempt ${attempt} failed for controller ${controllerId}`, error as Error);

        if (attempt === maxRetries) {
          Logger.error(`LocalMQTT - Failed to publish command to controller ${controllerId} after ${maxRetries} attempts`, error as Error);
          return; // Don't throw - allow system to continue
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Setup subscriptions
   * @param subscriptionConfig - Subscription configuration
   */
  public async setupSubscriptions(subscriptionConfig: SubscriptionConfig): Promise<void> {
    try {
      await this.subscribe(subscriptionConfig);
      Logger.info('LocalMQTT - Subscriptions setup complete');
    } catch (error) {
      Logger.error('LocalMQTT - Failed to setup subscriptions', error as Error);
      throw error;
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
