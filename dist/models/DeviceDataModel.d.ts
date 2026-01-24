/**
 * Device Data Model
 * Manages state of all devices (RPI, Aircon, Lighting)
 */
import { AppConfig, DeviceDataState, RPIState, AirconMeasure } from '../types';
declare class DeviceDataModel {
    state: DeviceDataState;
    constructor(config: AppConfig);
    /**
     * Get complete device state
     * @returns {DeviceDataState} Complete device state
     */
    getDeviceState(): DeviceDataState;
    /**
     * Get MQTT broker state
     * @returns {boolean} Online status
     */
    getMqttBrokerState(): boolean;
    /**
     * Set MQTT broker state
     * @param {boolean} status - Online status
     */
    setMqttBrokerState(status: boolean): void;
    /**
     * Update RPI state
     * @param {number} id - RPI ID (0, 1, 2, etc.)
     * @param {Partial<RPIState>} data - Data to update
     */
    updateRpiState(id: number, data: Partial<RPIState>): void;
    /**
     * Ensure RPI array is large enough for the given ID
     * @private
     * @param id - RPI ID to accommodate
     */
    private _ensureRpiCapacity;
    /**
     * Update RPI detection data
     * @param {number} id - RPI ID (0, 1, 2, etc.)
     * @param {PersonDetectionMessage} detection - Detection data {isPerson, prob}
     */
    updateRpiDetection(id: number, detection: {
        isPerson: boolean;
        prob: number;
    }): void;
    /**
     * Reset RPI state when offline
     * @param {number} id - RPI ID (0, 1, 2, etc.)
     */
    resetRpiState(id: number): void;
    /**
     * Update aircon controller properties
     * @param {number} id - Controller ID (0, 1, or 2)
     * @param {{ wifiLocalIP: string; online: boolean; bootcount: number }} properties - Properties to update
     */
    updateAirconProperties(id: number, properties: {
        wifiLocalIP: string;
        online: boolean;
        bootcount: number;
    }): void;
    /**
     * Update aircon controller measure data
     * @param {number} id - Controller ID (0, 1, or 2)
     * @param {AirconMeasure} measure - Measurement data
     */
    updateAirconMeasure(id: number, measure: AirconMeasure): void;
    /**
     * Reset aircon measurements when offline
     * @param {number} id - Controller ID (0, 1, or 2)
     */
    resetAirconMeasure(id: number): void;
    /**
     * Set aircon controller command
     * @param {number} id - Controller ID (0, 1, or 2)
     * @param {boolean} command - Command state (true=on, false=off)
     */
    setAirconCommand(id: number, command: boolean): void;
    /**
     * Set all aircon controllers
     * @param {boolean} command - Command state (true=on, false=off)
     */
    setAllControllers(command: boolean): void;
    /**
     * Update timestamp
     */
    updateTimestamp(): void;
    /**
     * Get timestamp
     * @returns {Date} Current timestamp
     */
    getTimeStamp(): Date;
    /**
     * Check if all RPIs are offline
     * @returns {boolean} True if all RPIs are offline
     */
    areAllRpisOffline(): boolean;
    /**
     * Check if any RPI is online
     * @returns {boolean} True if at least one RPI is online
     */
    isAnyRpiOnline(): boolean;
}
export default DeviceDataModel;
//# sourceMappingURL=DeviceDataModel.d.ts.map