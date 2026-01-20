/**
 * Cloud MQTT Service
 * Manages cloud MQTT broker connection for data relay
 */

const MqttClient = require('./MqttClient');
const Logger = require('../../utils/Logger');

class CloudMqttService extends MqttClient {
  constructor(config) {
    super(config, 'CloudMQTT');
    this.initialized = false;
  }

  /**
   * Initialize cloud MQTT service
   */
  async initialize() {
    try {
      await this.connect();

      // Publish online status
      await this.relayServerStatus('true');

      this.initialized = true;
      Logger.info('CloudMQTT - Service initialized');
    } catch (error) {
      Logger.error('CloudMQTT - Initialization failed', error);
      throw error;
    }
  }

  /**
   * Relay RPI detection data to cloud
   * @param {number} rpiId - RPI ID (1 or 2)
   * @param {string} topic - Original topic
   * @param {string} message - Message payload
   * @param {number} qos - QoS level
   */
  async relayRpiData(rpiId, topic, message, qos = 0) {
    await this.publish(topic, message, { qos, retain: true });
    Logger.debug(`CloudMQTT - RPI${rpiId} data relayed`);
  }

  /**
   * Relay RPI online status to cloud
   * @param {number} rpiId - RPI ID (1 or 2)
   * @param {string} topic - Original topic
   * @param {string} message - Message payload
   */
  async relayRpiOnlineStatus(rpiId, topic, message) {
    await this.publish(topic, message, { qos: 2, retain: true });
    Logger.debug(`CloudMQTT - RPI${rpiId} online status relayed`);
  }

  /**
   * Relay aircon measurement data to cloud
   * @param {number} controllerId - Controller ID (1, 2, or 3)
   * @param {string} topic - Original topic
   * @param {string} message - Message payload
   */
  async relayAirconMeasure(controllerId, topic, message) {
    await this.publish(topic, message, { qos: 0, retain: true });
    Logger.debug(`CloudMQTT - Aircon controller ${controllerId} measurement relayed`);
  }

  /**
   * Relay aircon properties to cloud
   * @param {number} controllerId - Controller ID (1, 2, or 3)
   * @param {string} topic - Original topic
   * @param {string} message - Message payload
   */
  async relayAirconProperties(controllerId, topic, message) {
    await this.publish(topic, message, { qos: 2, retain: true });
    Logger.debug(`CloudMQTT - Aircon controller ${controllerId} properties relayed`);
  }

  /**
   * Relay server status to cloud
   * @param {string} status - 'true' or 'false'
   */
  async relayServerStatus(status) {
    await this.publish(
      'myFinalProject/server/properties/online',
      status,
      { qos: 2, retain: true }
    );
    Logger.debug(`CloudMQTT - Server status relayed: ${status}`);
  }

  /**
   * Relay controller command to cloud
   * @param {number} controllerId - Controller ID (1, 2, or 3)
   * @param {string} command - Command ('true' or 'false')
   */
  async relayControllerCommand(controllerId, command) {
    const topic = `myFinalProject/server/electricalAppliances/airconController${controllerId}/command`;
    await this.publish(topic, command, { qos: 0, retain: true });
    Logger.debug(`CloudMQTT - Controller ${controllerId} command relayed: ${command}`);
  }

  /**
   * Check if service is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }
}

module.exports = CloudMqttService;
