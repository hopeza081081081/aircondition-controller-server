/**
 * Device Controller
 * Manages device operations and periodic events
 */

const Logger = require('../utils/Logger');

class DeviceController {
  constructor(deviceModel, personDetection, dataSync, config) {
    this.deviceModel = deviceModel;
    this.personDetection = personDetection;
    this.dataSync = dataSync;
    this.config = config;
    this.eventInterval = null;
    this.running = false;
    Logger.info('DeviceController initialized');
  }

  /**
   * Start device controller
   */
  start() {
    if (this.running) {
      Logger.warn('DeviceController already running');
      return;
    }

    this.running = true;

    // Start event processing loop
    this.eventInterval = setInterval(() => {
      this._processEvent();
    }, this.config.app.eventProcessInterval);

    Logger.info('DeviceController started', {
      interval: `${this.config.app.eventProcessInterval}ms`
    });
  }

  /**
   * Stop device controller
   */
  stop() {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.eventInterval) {
      clearInterval(this.eventInterval);
      this.eventInterval = null;
    }

    Logger.info('DeviceController stopped');
  }

  /**
   * Process periodic event
   * @private
   */
  async _processEvent() {
    try {
      // Update timestamp
      this.deviceModel.updateTimestamp();

      // Check RPI status and control aircons accordingly
      if (this.deviceModel.areAllRpisOffline()) {
        await this._handleAllRpisOffline();
      } else if (this.deviceModel.isAnyRpiOnline()) {
        await this._handleAnyRpiOnline();
      }

      // Send data to MongoDB worker thread
      this.dataSync.sendData(this.deviceModel.getDeviceState());
    } catch (error) {
      Logger.error('DeviceController event processing error', error);
    }
  }

  /**
   * Handle all RPIs offline scenario
   * @private
   */
  async _handleAllRpisOffline() {
    Logger.warn('All RPIs are offline, turning off all aircons');

    const controllerCount = this.deviceModel.state.airconController.length;

    for (let i = 0; i < controllerCount; i++) {
      const controllerId = i + 1;

      // Publish to local MQTT
      await this.dataSync.localMqtt?.publishCommand(controllerId, 'false');

      // Publish to cloud MQTT
      await this.dataSync.cloudMqtt?.relayControllerCommand(controllerId, 'false');
    }
  }

  /**
   * Handle at least one RPI online scenario
   * @private
   */
  async _handleAnyRpiOnline() {
    // Execute person detection logic
    await this.personDetection.execute();
  }

  /**
   * Check if controller is running
   * @returns {boolean}
   */
  isRunning() {
    return this.running;
  }
}

module.exports = DeviceController;
