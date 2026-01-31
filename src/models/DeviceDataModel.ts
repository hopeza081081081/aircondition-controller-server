/**
 * Device Data Model
 * Manages state of all devices (RPI, Aircon, Lighting)
 */

import { AppConfig, DeviceDataState, RPIState, AirconMeasure } from '../types';
const Logger = require('../utils/Logger');

class DeviceDataModel {
  public state: DeviceDataState;

  constructor(config: AppConfig) {
    // Initialize from config
    this.state = JSON.parse(JSON.stringify(config.deviceDataModel)) as DeviceDataState;
    Logger.info('DeviceDataModel initialized', {
      rpiCount: this.state.rpi.length,
      airconCount: this.state.airconController.length,
      lightingCount: this.state.lightingController.length
    });
  }

  /**
   * Get complete device state
   * @returns {DeviceDataState} Complete device state
   */
  public getDeviceState(): DeviceDataState {
    return this.state;
  }

  /**
   * Get MQTT broker state
   * @returns {boolean} Online status
   */
  public getMqttBrokerState(): boolean {
    return this.state.MQTTbroker.online;
  }

  /**
   * Set MQTT broker state
   * @param {boolean} status - Online status
   */
  public setMqttBrokerState(status: boolean): void {
    this.state.MQTTbroker.online = status;
  }

  /**
   * Update RPI state
   * @param {number} id - RPI ID (0, 1, 2, etc.)
   * @param {Partial<RPIState>} data - Data to update
   */
  public updateRpiState(id: number, data: Partial<RPIState>): void {
    this._ensureRpiCapacity(id);

    Object.assign(this.state.rpi[id], data);
    Logger.debug(`RPI${id + 1} state updated`, data);
  }

  /**
   * Ensure RPI array is large enough for the given ID
   * @private
   * @param id - RPI ID to accommodate
   */
  private _ensureRpiCapacity(id: number): void {
    if (id >= this.state.rpi.length) {
      const oldLength = this.state.rpi.length;
      // Expand array with default RPI states
      for (let i = this.state.rpi.length; i <= id; i++) {
        this.state.rpi.push({
          online: false,
          isperson: false,
          prob: 0.0
        });
      }
      Logger.info(`RPI array expanded from ${oldLength} to ${this.state.rpi.length}`, {
        newRpiCount: this.state.rpi.length
      });
    }
  }

  /**
   * Update RPI detection data
   * @param {number} id - RPI ID (0, 1, 2, etc.)
   * @param {PersonDetectionMessage} detection - Detection data {isPerson, prob}
   */
  public updateRpiDetection(id: number, detection: { isPerson: boolean; prob: number }): void {
    this._ensureRpiCapacity(id);

    this.updateRpiState(id, {
      isperson: detection.isPerson,
      prob: detection.prob
    });
  }

  /**
   * Reset RPI state when offline
   * @param {number} id - RPI ID (0, 1, 2, etc.)
   */
  public resetRpiState(id: number): void {
    this._ensureRpiCapacity(id);

    this.updateRpiState(id, {
      online: false,
      isperson: false,
      prob: 0.0
    });
  }

  /**
   * Ensure aircon controller array is large enough for the given ID
   * @private
   * @param id - Controller ID to accommodate
   */
  private _ensureAirconCapacity(id: number): void {
    if (id >= this.state.airconController.length) {
      const oldLength = this.state.airconController.length;
      // Expand array with default aircon controller states
      for (let i = this.state.airconController.length; i <= id; i++) {
        this.state.airconController.push({
          controllercmd: false,
          properties: {
            wifiLocalIP: '',
            online: false,
            bootcount: 0
          },
          measure: {
            voltage: null,
            current: null,
            power: null,
            energy: null,
            frequency: null
          }
        });
      }
      Logger.info(`Aircon controller array expanded from ${oldLength} to ${this.state.airconController.length}`, {
        newControllerCount: this.state.airconController.length
      });
    }
  }

  /**
   * Update aircon controller properties
   * @param {number} id - Controller ID (0, 1, 2, etc.)
   * @param {{ wifiLocalIP: string; online: boolean; bootcount: number }} properties - Properties to update
   */
  public updateAirconProperties(
    id: number,
    properties: { wifiLocalIP: string; online: boolean; bootcount: number }
  ): void {
    this._ensureAirconCapacity(id);

    Object.assign(this.state.airconController[id].properties, properties);
    Logger.debug(`Aircon controller ${id} properties updated`, properties);
  }

  /**
   * Update aircon controller measure data
   * @param {number} id - Controller ID (0, 1, 2, etc.)
   * @param {AirconMeasure} measure - Measurement data
   */
  public updateAirconMeasure(id: number, measure: AirconMeasure): void {
    this._ensureAirconCapacity(id);

    this.state.airconController[id].measure = measure;
    Logger.debug(`Aircon controller ${id} measure updated`, measure);
  }

  /**
   * Reset aircon measurements when offline
   * @param {number} id - Controller ID (0, 1, 2, etc.)
   */
  public resetAirconMeasure(id: number): void {
    this._ensureAirconCapacity(id);

    this.state.airconController[id].measure = {
      voltage: null,
      current: null,
      power: null,
      energy: null,
      frequency: null
    };

    Logger.debug(`Aircon controller ${id} measurements reset`);
  }

  /**
   * Set aircon controller command
   * @param {number} id - Controller ID (0, 1, 2, etc.)
   * @param {boolean} command - Command state (true=on, false=off)
   */
  public setAirconCommand(id: number, command: boolean): void {
    this._ensureAirconCapacity(id);

    this.state.airconController[id].controllercmd = command;
    Logger.debug(`Aircon controller ${id} command set to ${command}`);
  }

  /**
   * Set all aircon controllers
   * @param {boolean} command - Command state (true=on, false=off)
   */
  public setAllControllers(command: boolean): void {
    for (let i = 0; i < this.state.airconController.length; i++) {
      this.setAirconCommand(i, command);
    }
    Logger.info(`All aircon controllers set to ${command}`);
  }

  /**
   * Update timestamp
   */
  public updateTimestamp(): void {
    this.state.timeStamp = new Date();
  }

  /**
   * Get timestamp
   * @returns {Date} Current timestamp
   */
  public getTimeStamp(): Date {
    return this.state.timeStamp;
  }

  /**
   * Check if all RPIs are offline
   * @returns {boolean} True if all RPIs are offline
   */
  public areAllRpisOffline(): boolean {
    return this.state.rpi.every(rpi => !rpi.online);
  }

  /**
   * Check if any RPI is online
   * @returns {boolean} True if at least one RPI is online
   */
  public isAnyRpiOnline(): boolean {
    return this.state.rpi.some(rpi => rpi.online);
  }
}

export default DeviceDataModel;
