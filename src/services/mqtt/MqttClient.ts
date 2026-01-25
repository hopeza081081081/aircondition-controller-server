/**
 * MQTT Client Base Class
 * Generic MQTT client with connection management
 */

import * as mqtt from 'mqtt';
import { MqttConfig, PublishOptions } from '../../types';
const Logger = require('../../utils/Logger');

export class MqttClient {
  protected config: MqttConfig;
  protected clientName: string;
  protected client: mqtt.MqttClient | null;
  protected manualDisconnect: boolean;

  constructor(config: MqttConfig, clientName: string) {
    this.config = config;
    this.clientName = clientName;
    this.client = null;
    this.manualDisconnect = false;
    Logger.info(`${this.clientName} - MQTT client initialized`, {
      host: config.host,
      port: config.port
    });
  }

  /**
   * Connect to MQTT broker
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Clean up existing client if any (prevent memory leak)
      if (this.client) {
        Logger.debug(`${this.clientName} - Cleaning up existing client before reconnect`);
        try {
          this.client.end(true); // Force close without waiting for disconnect packet
        } catch (error) {
          Logger.warn(`${this.clientName} - Error cleaning up existing client`, error as Error);
        }
        this.client = null;
      }

      Logger.info(`${this.clientName} - Connecting to MQTT broker`, {
        host: this.config.host,
        port: this.config.port
      });

      this.client = mqtt.connect(this.config);

      // Register event handlers for this connection attempt
      this.client.on('connect', () => {
        Logger.info(`${this.clientName} - Connected to MQTT broker`);
        resolve();
      });

      this.client.on('error', (error: Error) => {
        Logger.error(`${this.clientName} - MQTT connection error`, error);
        reject(error);
      });

      this.client.on('offline', () => {
        Logger.warn(`${this.clientName} - MQTT broker offline`);
      });

      this.client.on('reconnect', () => {
        Logger.info(`${this.clientName} - Reconnecting to MQTT broker`);
      });

      // Set timeout for connection
      setTimeout(() => {
        if (!this.client || !this.client.connected) {
          reject(new Error(`${this.clientName} - Connection timeout`));
        }
      }, 30000);
    });
  }

  /**
   * Register event handler
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  public on(event: string, handler: (...args: any[]) => void): void {
    if (this.client) {
      this.client.on(event, handler);
    }
  }

  /**
   * Publish message to topic
   * @param {string} topic - MQTT topic
   * @param {string} message - Message to publish
   * @param {PublishOptions} options - Publish options {qos, retain}
   */
  public async publish(topic: string, message: string, options: PublishOptions = { qos: 0, retain: false }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        Logger.warn(`${this.clientName} - Not connected, cannot publish to ${topic}`);
        reject(new Error('Not connected'));
        return;
      }

      this.client.publish(topic, message, options, (error?: Error) => {
        if (error) {
          Logger.error(`${this.clientName} - Publish error`, error, { topic });
          reject(error);
        } else {
          Logger.debug(`${this.clientName} - Message published`, { topic, message });
          resolve();
        }
      });
    });
  }

  /**
   * Subscribe to topics
   * @param {{ [topic: string]: { qos: number } }} topics - Topics to subscribe
   */
  public async subscribe(topics: { [topic: string]: { qos: number } }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        Logger.warn(`${this.clientName} - Not connected, cannot subscribe`);
        reject(new Error('Not connected'));
        return;
      }

      this.client.subscribe(topics as any, (error?: Error) => {
        if (error) {
          Logger.error(`${this.clientName} - Subscribe error`, error);
          reject(error);
        } else {
          Logger.info(`${this.clientName} - Subscribed to topics`, { topics });
          resolve();
        }
      });
    });
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  public isConnected(): boolean {
    return this.client !== null && this.client.connected;
  }

  /**
   * Disconnect from broker
   */
  public disconnect(): void {
    this.manualDisconnect = true;
    if (this.client) {
      this.client.end();
      Logger.info(`${this.clientName} - Disconnected from MQTT broker`);
    }
  }
}
