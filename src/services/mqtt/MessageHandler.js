/**
 * MQTT Message Handler
 * Processes incoming MQTT messages and updates device state
 */

const Logger = require('../../utils/Logger');

class MessageHandler {
  constructor(deviceModel, cloudMqtt) {
    this.deviceModel = deviceModel;
    this.cloudMqtt = cloudMqtt;
    Logger.info('MessageHandler initialized');
  }

  /**
   * Handle incoming MQTT message
   * @param {string} topic - MQTT topic
   * @param {Buffer} message - Message payload
   */
  async handle(topic, message) {
    try {
      const messageStr = message.toString();
      Logger.debug('Message received', { topic, message: messageStr });

      // RPI1 Object Detector
      if (topic === 'myFinalProject/rpi1/objDetector') {
        await this._handleRpiObjDetector(1, messageStr);
      }
      // RPI1 Online Status
      else if (topic === 'myFinalProject/rpi1/onlineStatus/online') {
        await this._handleRpiOnlineStatus(0, messageStr);
      }
      // RPI2 Object Detector
      else if (topic === 'myFinalProject/rpi2/objDetector') {
        await this._handleRpiObjDetector(2, messageStr);
      }
      // RPI2 Online Status
      else if (topic === 'myFinalProject/rpi2/onlineStatus/online') {
        await this._handleRpiOnlineStatus(1, messageStr);
      }
      // Aircon Controller 1
      else if (topic.startsWith('myFinalProject/airconController1/')) {
        await this._handleAirconData(0, topic, messageStr);
      }
      // Aircon Controller 2
      else if (topic.startsWith('myFinalProject/airconController2/')) {
        await this._handleAirconData(1, topic, messageStr);
      }
      // Aircon Controller 3
      else if (topic.startsWith('myFinalProject/airconController3/')) {
        await this._handleAirconData(2, topic, messageStr);
      }
      else {
        Logger.warn('Unknown topic', { topic });
      }
    } catch (error) {
      Logger.error('MQTT message handling error', error, { topic });
    }
  }

  /**
   * Handle RPI object detector message
   * @private
   * @param {number} rpiId - RPI ID (1 or 2)
   * @param {string} message - Message payload
   */
  async _handleRpiObjDetector(rpiId, message) {
    const topic = `myFinalProject/rpi${rpiId}/objDetector`;

    // Relay to cloud
    await this.cloudMqtt.relayRpiData(rpiId, topic, message, 0);

    // Parse detection data
    try {
      const detection = JSON.parse(message);
      this.deviceModel.updateRpiDetection(rpiId - 1, detection);
    } catch (error) {
      Logger.error(`Failed to parse RPI${rpiId} detection message`, error);
    }
  }

  /**
   * Handle RPI online status message
   * @private
   * @param {number} rpiIndex - RPI index (0 or 1)
   * @param {string} message - Message payload
   */
  async _handleRpiOnlineStatus(rpiIndex, message) {
    const rpiId = rpiIndex + 1;
    const topic = `myFinalProject/rpi${rpiId}/onlineStatus/online`;

    // Relay to cloud
    await this.cloudMqtt.relayRpiOnlineStatus(rpiId, topic, message);

    // Update RPI state
    if (message === 'true') {
      this.deviceModel.updateRpiState(rpiIndex, { online: true });
    } else if (message === 'false') {
      this.deviceModel.resetRpiState(rpiIndex);
    }
  }

  /**
   * Handle aircon controller data
   * @private
   * @param {number} controllerIndex - Controller index (0, 1, or 2)
   * @param {string} topic - MQTT topic
   * @param {string} message - Message payload
   */
  async _handleAirconData(controllerIndex, topic, message) {
    const controllerId = controllerIndex + 1;

    // Relay to cloud
    if (topic.includes('/measure')) {
      await this.cloudMqtt.relayAirconMeasure(controllerId, topic, message);
      this._handleAirconMeasure(controllerIndex, message);
    } else if (topic.includes('/properties')) {
      await this.cloudMqtt.relayAirconProperties(controllerId, topic, message);
      this._handleAirconProperties(controllerIndex, message);
    }
  }

  /**
   * Handle aircon measurement data
   * @private
   * @param {number} controllerIndex - Controller index (0, 1, or 2)
   * @param {string} message - Message payload
   */
  _handleAirconMeasure(controllerIndex, message) {
    try {
      const measure = JSON.parse(message);
      this.deviceModel.updateAirconMeasure(controllerIndex, measure);
    } catch (error) {
      Logger.error(`Failed to parse aircon controller ${controllerIndex + 1} measurement`, error);
    }
  }

  /**
   * Handle aircon properties data
   * @private
   * @param {number} controllerIndex - Controller index (0, 1, or 2)
   * @param {string} message - Message payload
   */
  _handleAirconProperties(controllerIndex, message) {
    try {
      const properties = JSON.parse(message);

      // Update properties
      this.deviceModel.updateAirconProperties(controllerIndex, {
        wifiLocalIP: properties.wifiLocalIP,
        online: properties.online === 'true' || properties.online === true,
        bootcount: properties.bootcount
      });

      // Reset measurements if offline
      if (properties.online === 'false' || properties.online === false) {
        this.deviceModel.resetAirconMeasure(controllerIndex);
      }
    } catch (error) {
      Logger.error(`Failed to parse aircon controller ${controllerIndex + 1} properties`, error);
    }
  }
}

module.exports = MessageHandler;
