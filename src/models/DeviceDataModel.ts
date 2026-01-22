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
   * @param {number} id - RPI ID (0 or 1)
   * @param {Partial<RPIState>} data - Data to update
   */
  public updateRpiState(id: number, data: Partial<RPIState>): void {
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
   * @param {PersonDetectionMessage} detection - Detection data {isPerson, prob}
   */
  public updateRpiDetection(id: number, detection: { isPerson: boolean; prob: number }): void {
    this.updateRpiState(id, {
      isperson: detection.isPerson,
      prob: detection.prob
    });
  }

  /**
   * Reset RPI state when offline
   * @param {number} id - RPI ID (0 or 1)
   */
  public resetRpiState(id: number): void {
    this.updateRpiState(id, {
      online: false,
      isperson: false,
      prob: 0.0
    });
  }

  /**
   * Update aircon controller properties
   * @param {number} id - Controller ID (0, 1, or 2)
   * @param {{ wifiLocalIP: string; online: boolean; bootcount: number }} properties - Properties to update
   */
  public updateAirconProperties(
    id: number,
    properties: { wifiLocalIP: string; online: boolean; bootcount: number }
  ): void {
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
   * @param {AirconMeasure} measure - Measurement data
   */
  public updateAirconMeasure(id: number, measure: AirconMeasure): void {
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
  public resetAirconMeasure(id: number): void {
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
  public setAirconCommand(id: number, command: boolean): void {
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
