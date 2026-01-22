/**
 * Device Data Model
 * Manages state of all devices (RPI, Aircon, Lighting)
 */

const Logger = require('../utils/Logger');

class DeviceDataModel {
  constructor(config) {
    // Initialize from config
    this.state = JSON.parse(JSON.stringify(config.deviceDataModel));
    Logger.info('DeviceDataModel initialized', {
      rpiCount: this.state.rpi.length,
      airconCount: this.state.airconController.length,
      lightingCount: this.state.lightingController.length
    });
  }

  /**
   * Get complete device state
   * @returns {Object} Complete device state
   */
  getDeviceState() {
    return this.state;
  }

  /**
   * Get MQTT broker state
   * @returns {boolean} Online status
   */
  getMqttBrokerState() {
    return this.state.MQTTbroker.online;
  }

  /**
   * Set MQTT broker state
   * @param {boolean} status - Online status
   */
  setMqttBrokerState(status) {
    this.state.MQTTbroker.online = status;
  }

  /**
   * Update RPI state
   * @param {number} id - RPI ID (0 or 1)
   * @param {Object} data - Data to update
   */
  updateRpiState(id, data) {
    if (id < 0 || id >= this.state.rpi.length) {
      Logger.warn(`Invalid RPI ID: ${id}`);
      return;
    }

    Object.assign(this.state.rpi[id], data);
    Logger.debug(`RPI${id + 1} state updated`, data);
  }

  /**
   * Update RPI detection data
   * @param {number} id - RPI ID (0 or 1)
   * @param {Object} detection - Detection data {isPerson, prob}
   */
  updateRpiDetection(id, detection) {
    this.updateRpiState(id, {
      isperson: detection.isPerson,
      prob: detection.prob
    });
  }

  /**
   * Reset RPI state when offline
   * @param {number} id - RPI ID (0 or 1)
   */
  resetRpiState(id) {
    this.updateRpiState(id, {
      online: false,
      isperson: false,
      prob: 0.0
    });
  }

  /**
   * Update aircon controller properties
   * @param {number} id - Controller ID (0, 1, or 2)
   * @param {Object} properties - Properties to update
   */
  updateAirconProperties(id, properties) {
    if (id < 0 || id >= this.state.airconController.length) {
      Logger.warn(`Invalid Aircon controller ID: ${id}`);
      return;
    }

    Object.assign(this.state.airconController[id].properties, properties);
    Logger.debug(`Aircon controller ${id + 1} properties updated`, properties);
  }

  /**
   * Update aircon controller measure data
   * @param {number} id - Controller ID (0, 1, or 2)
   * @param {Object} measure - Measurement data
   */
  updateAirconMeasure(id, measure) {
    if (id < 0 || id >= this.state.airconController.length) {
      Logger.warn(`Invalid Aircon controller ID: ${id}`);
      return;
    }

    this.state.airconController[id].measure = measure;
    Logger.debug(`Aircon controller ${id + 1} measure updated`, measure);
  }

  /**
   * Reset aircon measurements when offline
   * @param {number} id - Controller ID (0, 1, or 2)
   */
  resetAirconMeasure(id) {
    if (id < 0 || id >= this.state.airconController.length) {
      Logger.warn(`Invalid Aircon controller ID: ${id}`);
      return;
    }

    this.state.airconController[id].measure = {
      voltage: null,
      current: null,
      power: null,
      energy: null,
      frequency: null
    };

    Logger.debug(`Aircon controller ${id + 1} measurements reset`);
  }

  /**
   * Set aircon controller command
   * @param {number} id - Controller ID (0, 1, or 2)
   * @param {boolean} command - Command state (true=on, false=off)
   */
  setAirconCommand(id, command) {
    if (id < 0 || id >= this.state.airconController.length) {
      Logger.warn(`Invalid Aircon controller ID: ${id}`);
      return;
    }

    this.state.airconController[id].controllercmd = command;
    Logger.debug(`Aircon controller ${id + 1} command set to ${command}`);
  }

  /**
   * Set all aircon controllers
   * @param {boolean} command - Command state (true=on, false=off)
   */
  setAllControllers(command) {
    for (let i = 0; i < this.state.airconController.length; i++) {
      this.setAirconCommand(i, command);
    }
    Logger.info(`All aircon controllers set to ${command}`);
  }

  /**
   * Update timestamp
   */
  updateTimestamp() {
    this.state.timeStamp = new Date();
  }

  /**
   * Get timestamp
   * @returns {Date} Current timestamp
   */
  getTimeStamp() {
    return this.state.timeStamp;
  }

  /**
   * Check if all RPIs are offline
   * @returns {boolean} True if all RPIs are offline
   */
  areAllRpisOffline() {
    return this.state.rpi.every(rpi => !rpi.online);
  }

  /**
   * Check if any RPI is online
   * @returns {boolean} True if at least one RPI is online
   */
  isAnyRpiOnline() {
    return this.state.rpi.some(rpi => rpi.online);
  }
}

module.exports = DeviceDataModel;
