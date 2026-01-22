/**
 * MQTT Client Base Class
 * Generic MQTT client with connection management
 */

const mqtt = require('mqtt');
const Logger = require('../../utils/Logger');

class MqttClient {
  constructor(config, clientName) {
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
  connect() {
    return new Promise((resolve, reject) => {
      Logger.info(`${this.clientName} - Connecting to MQTT broker`, {
        host: this.config.host,
        port: this.config.port
      });

      this.client = mqtt.connect(this.config);

      this.client.on('connect', () => {
        Logger.info(`${this.clientName} - Connected to MQTT broker`);
        resolve();
      });

      this.client.on('error', (error) => {
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
        if (!this.client.connected) {
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
  on(event, handler) {
    if (this.client) {
      this.client.on(event, handler);
    }
  }

  /**
   * Publish message to topic
   * @param {string} topic - MQTT topic
   * @param {string|Buffer} message - Message to publish
   * @param {Object} options - Publish options {qos, retain}
   */
  publish(topic, message, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        Logger.warn(`${this.clientName} - Not connected, cannot publish to ${topic}`);
        reject(new Error('Not connected'));
        return;
      }

      this.client.publish(topic, message, options, (error) => {
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
   * @param {Object} topics - Topics to subscribe {topic: {qos}}
   */
  subscribe(topics) {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        Logger.warn(`${this.clientName} - Not connected, cannot subscribe`);
        reject(new Error('Not connected'));
        return;
      }

      this.client.subscribe(topics, (error) => {
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
  isConnected() {
    return this.client && this.client.connected;
  }

  /**
   * Disconnect from broker
   */
  disconnect() {
    this.manualDisconnect = true;
    if (this.client) {
      this.client.end();
      Logger.info(`${this.clientName} - Disconnected from MQTT broker`);
    }
  }
}

module.exports = MqttClient;
