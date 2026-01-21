/**
 * Device Controller
 * Manages device operations and periodic events
 */

const Logger = require('../utils/Logger');

class DeviceController {
  constructor(deviceModel, personDetection, localMqtt, cloudMqtt, config) {
    this.deviceModel = deviceModel;
    this.personDetection = personDetection;
    this.localMqtt = localMqtt;
    this.cloudMqtt = cloudMqtt;
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

      // Note: MongoDB saving is handled by MongoDBService.startPeriodicSaving()
      // This method is called periodically by the service itself
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

      try {
        // Publish to local MQTT (only if connected)
        if (this.localMqtt && this.localMqtt.isConnected()) {
          await this.localMqtt.publishCommand(controllerId, 'false');
        } else {
          Logger.warn(`Local MQTT not connected - skipping controller ${controllerId} off command`);
        }

        // Publish to cloud MQTT (non-critical)
        if (this.cloudMqtt && this.cloudMqtt.isConnected()) {
          try {
            await this.cloudMqtt.relayControllerCommand(controllerId, 'false');
          } catch (cloudError) {
            Logger.warn(`Failed to relay controller ${controllerId} off command to cloud`, cloudError);
          }
        }
      } catch (error) {
        Logger.error(`Failed to turn off controller ${controllerId} when RPIs offline`, error);
      }
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
