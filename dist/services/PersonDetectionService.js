"use strict";
/**
 * Person Detection Service
 * Business logic for person detection and aircon control
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonDetectionService = void 0;
const Logger = require('../utils/Logger');
class PersonDetectionService {
    constructor(personDetectionState, deviceModel, localMqtt, cloudMqtt, config) {
        this.personDetectionState = personDetectionState;
        this.deviceModel = deviceModel;
        this.localMqtt = localMqtt;
        this.cloudMqtt = cloudMqtt;
        this.config = config;
        Logger.info('PersonDetectionService initialized');
    }
    /**
     * Execute person detection logic
     */
    async execute() {
        try {
            const detections = this.personDetectionState.getAllDetectionMessages();
            // Check if any RPI detected a person
            const anyPersonDetected = detections.some(detection => detection.isPerson);
            // No person detected by any RPI
            if (!anyPersonDetected) {
                await this._handleNoPersonDetected();
            }
            // Person detected by at least one RPI
            else {
                await this._handlePersonDetected();
            }
        }
        catch (error) {
            Logger.error('PersonDetectionService execution error', error);
        }
    }
    /**
     * Handle no person detected scenario
     * @private
     */
    async _handleNoPersonDetected() {
        // If person was detected before, start shutdown timer
        if (this.personDetectionState.getCurrentState()) {
            this.personDetectionState.setState(false);
            Logger.info('Person disappeared, starting shutdown timer');
            this.personDetectionState.startShutdownTimer(async () => {
                await this._turnOffAllAircons();
            }, this.config.app.airconPowerOffDuration);
        }
    }
    /**
     * Handle person detected scenario
     * @private
     */
    async _handlePersonDetected() {
        // If person was not detected before, turn on aircons
        if (!this.personDetectionState.getCurrentState()) {
            this.personDetectionState.clearShutdownTimer();
            this.personDetectionState.setState(true);
            Logger.info('Person detected, turning on aircons');
            await this._turnOnAllAircons();
        }
    }
    /**
     * Turn off all aircon controllers
     * @private
     */
    async _turnOffAllAircons() {
        const controllerCount = this.deviceModel.state.airconController.length;
        for (let i = 0; i < controllerCount; i++) {
            const controllerId = i + 1;
            try {
                // Publish to local MQTT (only if connected)
                if (this.localMqtt && this.localMqtt.isConnected()) {
                    await this.localMqtt.publishCommand(controllerId, 'false');
                }
                else {
                    Logger.warn(`Local MQTT not connected - skipping controller ${controllerId} off command`);
                }
                // Publish to cloud MQTT (non-critical)
                if (this.cloudMqtt && this.cloudMqtt.isConnected()) {
                    try {
                        await this.cloudMqtt.publish(`myFinalProject/server/electricalAppliances/airconController${controllerId}/command`, 'false', { qos: 0, retain: true });
                    }
                    catch (cloudError) {
                        Logger.warn(`Failed to relay controller ${controllerId} off command to cloud`, cloudError);
                    }
                }
                // Update device model
                this.deviceModel.setAirconCommand(i, false);
            }
            catch (error) {
                Logger.error(`Failed to turn off controller ${controllerId}`, error);
            }
        }
        Logger.info('All aircon controllers turned off');
    }
    /**
     * Turn on all aircon controllers
     * @private
     */
    async _turnOnAllAircons() {
        const controllerCount = this.deviceModel.state.airconController.length;
        for (let i = 0; i < controllerCount; i++) {
            const controllerId = i + 1;
            try {
                // Publish to local MQTT (only if connected)
                if (this.localMqtt && this.localMqtt.isConnected()) {
                    await this.localMqtt.publishCommand(controllerId, 'true');
                }
                else {
                    Logger.warn(`Local MQTT not connected - skipping controller ${controllerId} on command`);
                }
                // Publish to cloud MQTT (non-critical)
                if (this.cloudMqtt && this.cloudMqtt.isConnected()) {
                    try {
                        await this.cloudMqtt.publish(`myFinalProject/server/electricalAppliances/airconController${controllerId}/command`, 'true', { qos: 0, retain: true });
                    }
                    catch (cloudError) {
                        Logger.warn(`Failed to relay controller ${controllerId} on command to cloud`, cloudError);
                    }
                }
                // Update device model
                this.deviceModel.setAirconCommand(i, true);
            }
            catch (error) {
                Logger.error(`Failed to turn on controller ${controllerId}`, error);
            }
        }
        Logger.info('All aircon controllers turned on');
    }
}
exports.PersonDetectionService = PersonDetectionService;
exports.default = PersonDetectionService;
//# sourceMappingURL=PersonDetectionService.js.map