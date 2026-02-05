/**
 * Aircon Controller Service
 * Centralized service for controlling air conditioner devices
 * Eliminates code duplication across PersonDetectionService and RaspberrypiService
 */
import DeviceDataModel from "../models/DeviceDataModel";
import { LocalMqttService } from "./mqtt/LocalMqttService";
import { CloudMqttService } from "./mqtt/CloudMqttService";
export declare class AirconControllerService {
    private deviceModel;
    private localMqtt;
    private cloudMqtt;
    constructor(deviceModel: DeviceDataModel, localMqtt: LocalMqttService, cloudMqtt: CloudMqttService);
    /**
     * Set all aircon controllers to a specific state
     * @param command - Command state (true=on, false=off)
     * @param reason - Reason for the command (for logging)
     */
    setAllControllers(command: boolean, reason: string): Promise<void>;
    /**
     * Set a single aircon controller to a specific state
     * @param controllerId - Controller ID (0, 1, 2, etc.)
     * @param command - Command state (true=on, false=off)
     * @param reason - Reason for the command (for logging)
     */
    setSingleController(controllerId: number, command: boolean, reason: string): Promise<void>;
    /**
     * Turn off all aircon controllers
     * @param reason - Reason for turning off (for logging)
     */
    turnOffAll(reason: string): Promise<void>;
    /**
     * Turn on all aircon controllers
     * @param reason - Reason for turning on (for logging)
     */
    turnOnAll(reason: string): Promise<void>;
    /**
     * Relay command to cloud MQTT
     * @private
     * @param controllerId - Controller ID
     * @param command - Command string ('true' or 'false')
     */
    private _relayToCloud;
}
export default AirconControllerService;
//# sourceMappingURL=AirconControllerService.d.ts.map