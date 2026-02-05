"use strict";
/**
 * Aircon Controller Service
 * Centralized service for controlling air conditioner devices
 * Eliminates code duplication across PersonDetectionService and RaspberrypiService
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirconControllerService = void 0;
const constants_1 = require("../config/constants");
const Logger = require("../utils/Logger");
class AirconControllerService {
    constructor(deviceModel, localMqtt, cloudMqtt) {
        this.deviceModel = deviceModel;
        this.localMqtt = localMqtt;
        this.cloudMqtt = cloudMqtt;
        Logger.info("AirconControllerService initialized");
    }
    /**
     * Set all aircon controllers to a specific state
     * @param command - Command state (true=on, false=off)
     * @param reason - Reason for the command (for logging)
     */
    async setAllControllers(command, reason) {
        const controllerCount = this.deviceModel.state.airconController.length;
        const commandStr = command ? "on" : "off";
        Logger.info(`Setting all aircon controllers to ${commandStr}`, { reason });
        for (let i = 0; i < controllerCount; i++) {
            await this.setSingleController(i, command, reason);
        }
        Logger.info(`All aircon controllers set to ${commandStr}`);
    }
    /**
     * Set a single aircon controller to a specific state
     * @param controllerId - Controller ID (0, 1, 2, etc.)
     * @param command - Command state (true=on, false=off)
     * @param reason - Reason for the command (for logging)
     */
    async setSingleController(controllerId, command, reason) {
        const commandStr = command ? "true" : "false";
        try {
            // Publish to local MQTT (only if connected)
            if (this.localMqtt && this.localMqtt.isConnected()) {
                await this.localMqtt.publishCommand(controllerId, commandStr);
            }
            else {
                Logger.warn(`Local MQTT not connected - skipping controller ${controllerId} ${command ? "on" : "off"} command`);
            }
            // Publish to cloud MQTT (non-critical)
            await this._relayToCloud(controllerId, commandStr);
            // Update device model
            this.deviceModel.setAirconCommand(controllerId, command);
            Logger.debug(`Controller ${controllerId} set to ${command ? "on" : "off"}`, { reason });
        }
        catch (error) {
            Logger.error(`Failed to set controller ${controllerId} to ${command ? "on" : "off"}`, error, { reason });
        }
    }
    /**
     * Turn off all aircon controllers
     * @param reason - Reason for turning off (for logging)
     */
    async turnOffAll(reason) {
        await this.setAllControllers(false, reason);
    }
    /**
     * Turn on all aircon controllers
     * @param reason - Reason for turning on (for logging)
     */
    async turnOnAll(reason) {
        await this.setAllControllers(true, reason);
    }
    /**
     * Relay command to cloud MQTT
     * @private
     * @param controllerId - Controller ID
     * @param command - Command string ('true' or 'false')
     */
    async _relayToCloud(controllerId, command) {
        if (!this.cloudMqtt || !this.cloudMqtt.isConnected()) {
            return; // Cloud not connected - skip relay
        }
        try {
            // Get the identifier for this controller
            const identifier = this.localMqtt.getAirconIdentifier(controllerId);
            if (identifier) {
                const topic = `${constants_1.MQTT_TOPICS.AIRCON_COMMAND_BASE}/${identifier}/command`;
                await this.cloudMqtt.publish(topic, command, {
                    qos: constants_1.MQTT_QOS.AT_MOST_ONCE,
                    retain: true,
                });
            }
            else {
                Logger.warn(`No identifier found for controller index ${controllerId}`);
            }
        }
        catch (cloudError) {
            Logger.warn(`Failed to relay controller ${controllerId} command to cloud`, cloudError);
            // Non-critical error - don't throw
        }
    }
}
exports.AirconControllerService = AirconControllerService;
exports.default = AirconControllerService;
//# sourceMappingURL=AirconControllerService.js.map