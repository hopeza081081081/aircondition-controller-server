/**
 * Local MQTT Service
 * Manages local MQTT broker connection
 */

const MqttClient = require('./MqttClient');
const Logger = require('../../utils/Logger');

class LocalMqttService extends MqttClient {
  constructor(config) {
    super(config, 'LocalMQTT');
    this.initialized = false;
  }

  /**
   * Initialize local MQTT service (non-blocking)
   * Connection failures won't crash the application
   */
  async initialize() {
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
      Logger.error('LocalMQTT - Initialization failed, but application will continue', error);
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
  _startReconnectLoop() {
    const reconnectInterval = setInterval(async () => {
      if (this.isConnected()) {
        clearInterval(reconnectInterval);
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
        clearInterval(reconnectInterval);
        Logger.info('LocalMQTT - Reconnected and initialized');
      } catch (error) {
        Logger.warn('LocalMQTT - Reconnection attempt failed', error);
      }
    }, 30000); // Try every 30 seconds
  }

  /**
   * Publish server online status
   * @param {string} status - 'true' or 'false'
   */
  async publishOnlineStatus(status) {
    try {
      await this.publish(
        'myFinalProject/server/properties/online',
        status,
        { qos: 2, retain: true }
      );
    } catch (error) {
      Logger.error('LocalMQTT - Failed to publish online status', error);
      // Don't throw - non-critical error
    }
  }

  /**
   * Publish command to aircon controller with retry
   * @param {number} controllerId - Controller ID (1, 2, or 3)
   * @param {string} command - Command ('true' or 'false')
   */
  async publishCommand(controllerId, command) {
    const topic = `myFinalProject/server/electricalAppliances/airconController${controllerId}/command`;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.publish(topic, command, { qos: 2, retain: true });
        Logger.debug(`LocalMQTT - Command sent to controller ${controllerId}: ${command}`);
        return;
      } catch (error) {
        Logger.warn(`LocalMQTT - Publish attempt ${attempt} failed for controller ${controllerId}`, error);

        if (attempt === maxRetries) {
          Logger.error(`LocalMQTT - Failed to publish command to controller ${controllerId} after ${maxRetries} attempts`, error);
          return; // Don't throw - allow system to continue
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Setup subscriptions
   * @param {Object} subscriptionConfig - Subscription configuration
   */
  async setupSubscriptions(subscriptionConfig) {
    try {
      await this.subscribe(subscriptionConfig);
      Logger.info('LocalMQTT - Subscriptions setup complete');
    } catch (error) {
      Logger.error('LocalMQTT - Failed to setup subscriptions', error);
      throw error;
    }
  }

  /**
   * Check if service is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }
}

module.exports = LocalMqttService;
