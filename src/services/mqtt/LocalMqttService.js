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
   * Initialize local MQTT service
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
      Logger.info('LocalMQTT - Service initialized');
    } catch (error) {
      Logger.error('LocalMQTT - Initialization failed', error);
      throw error;
    }
  }

  /**
   * Publish server online status
   * @param {string} status - 'true' or 'false'
   */
  async publishOnlineStatus(status) {
    await this.publish(
      'myFinalProject/server/properties/online',
      status,
      { qos: 2, retain: true }
    );
  }

  /**
   * Publish command to aircon controller
   * @param {number} controllerId - Controller ID (1, 2, or 3)
   * @param {string} command - Command ('true' or 'false')
   */
  async publishCommand(controllerId, command) {
    const topic = `myFinalProject/server/electricalAppliances/airconController${controllerId}/command`;
    await this.publish(topic, command, { qos: 2, retain: true });
    Logger.debug(`LocalMQTT - Command sent to controller ${controllerId}: ${command}`);
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
