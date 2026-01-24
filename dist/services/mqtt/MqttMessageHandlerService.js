"use strict";
/**
 * MQTT Message Handler Service
 * Simple handler for processing MQTT messages and updating device state
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttMessageHandlerService = void 0;
const RpiTopicMapper_1 = __importDefault(require("../../utils/RpiTopicMapper"));
const Logger = require('../../utils/Logger');
class MqttMessageHandlerService {
    constructor(deviceModel, personDetectionState, cloudMqtt) {
        this.deviceModel = deviceModel;
        this.personDetectionState = personDetectionState;
        this.cloudMqtt = cloudMqtt;
        this.rpiMapper = new RpiTopicMapper_1.default(); // Initialize with default mappings (rpi1, rpi2)
        Logger.info('MqttMessageHandlerService initialized');
    }
    /**
     * Handle incoming MQTT message
     * @param topic - MQTT topic
     * @param message - Message payload
     */
    async handle(topic, message) {
        try {
            const messageStr = message.toString();
            Logger.debug('Message received', { topic, message: messageStr });
            // Update local state
            this._updateLocalState(topic, messageStr);
            // Relay to cloud (non-critical)
            await this._relayToCloud(topic, messageStr);
        }
        catch (error) {
            Logger.error('MQTT message handling error', error, { topic });
        }
    }
    /**
     * Update local device state based on message
     * @private
     * @param topic - MQTT topic
     * @param message - Message payload
     */
    _updateLocalState(topic, message) {
        // RPI Object Detector
        if (topic.includes('/objDetector')) {
            const rpiId = this._getRpiId(topic);
            try {
                const detection = JSON.parse(message);
                // Update device model
                this.deviceModel.updateRpiDetection(rpiId, detection);
                // Update person detection state (IMPORTANT!)
                this.personDetectionState.updateDetection(rpiId, detection);
                Logger.debug(`RPI${rpiId + 1} detection updated`, detection);
            }
            catch (error) {
                Logger.error(`Failed to parse RPI detection message`, error);
            }
        }
        // RPI Online Status
        else if (topic.includes('/onlineStatus/online')) {
            const rpiId = this._getRpiId(topic);
            if (message === 'true') {
                this.deviceModel.updateRpiState(rpiId, { online: true });
            }
            else if (message === 'false') {
                this.deviceModel.resetRpiState(rpiId);
            }
        }
        // Aircon Controller Measure
        else if (topic.includes('/measure')) {
            const controllerId = this._getControllerId(topic);
            try {
                const measure = JSON.parse(message);
                this.deviceModel.updateAirconMeasure(controllerId, measure);
            }
            catch (error) {
                Logger.error(`Failed to parse aircon controller ${controllerId + 1} measurement`, error);
            }
        }
        // Aircon Controller Properties
        else if (topic.includes('/properties')) {
            const controllerId = this._getControllerId(topic);
            try {
                const properties = JSON.parse(message);
                this.deviceModel.updateAirconProperties(controllerId, {
                    wifiLocalIP: properties.wifiLocalIP,
                    online: properties.online === 'true' || properties.online === true,
                    bootcount: properties.bootcount
                });
                // Reset measurements if offline
                if (properties.online === 'false' || properties.online === false) {
                    this.deviceModel.resetAirconMeasure(controllerId);
                }
            }
            catch (error) {
                Logger.error(`Failed to parse aircon controller ${controllerId + 1} properties`, error);
            }
        }
    }
    /**
     * Relay message to cloud MQTT
     * @private
     * @param topic - MQTT topic
     * @param message - Message payload
     */
    async _relayToCloud(topic, message) {
        if (!this.cloudMqtt || !this.cloudMqtt.isConnected()) {
            return; // Cloud not connected - skip relay
        }
        try {
            // Generic relay - just publish to same topic
            await this.cloudMqtt.publish(topic, message, { qos: 0, retain: true });
            Logger.debug('Message relayed to cloud', { topic });
        }
        catch (error) {
            Logger.warn('Failed to relay message to cloud', error);
            // Don't throw - cloud relay failure is non-critical
        }
    }
    /**
     * Extract RPI ID from topic
     * @private
     * @param topic - MQTT topic
     * @returns RPI index (0, 1, etc.) or -1 if not found
     *
     * Supports formats:
     * - Legacy: myFinalProject/rpi1/objDetector -> 0
     * - New: myFinalProject/rpi_B827EB400668/objDetector -> mapped index
     */
    _getRpiId(topic) {
        return this.rpiMapper.getRpiId(topic);
    }
    /**
     * Extract Aircon Controller ID from topic
     * @private
     * @param topic - MQTT topic
     * @returns Controller index (0, 1, or 2)
     */
    _getControllerId(topic) {
        if (topic.includes('/airconController1/'))
            return 0;
        if (topic.includes('/airconController2/'))
            return 1;
        if (topic.includes('/airconController3/'))
            return 2;
        return 0; // Default fallback
    }
}
exports.MqttMessageHandlerService = MqttMessageHandlerService;
exports.default = MqttMessageHandlerService;
//# sourceMappingURL=MqttMessageHandlerService.js.map