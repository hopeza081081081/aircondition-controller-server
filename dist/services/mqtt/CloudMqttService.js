"use strict";
/**
 * Cloud MQTT Service
 * Manages cloud MQTT broker connection for data relay
 * Simplified - uses generic publish method
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudMqttService = void 0;
const MqttClient_1 = require("./MqttClient");
const Logger = require('../../utils/Logger');
class CloudMqttService extends MqttClient_1.MqttClient {
    constructor(config) {
        super(config, 'CloudMQTT');
        this.initialized = false;
    }
    /**
     * Initialize cloud MQTT service (non-blocking)
     * Connection failures won't crash the application
     */
    async initialize() {
        try {
            await this.connect();
            // Publish online status
            await this.publishOnlineStatus('true');
            this.initialized = true;
            Logger.info('CloudMQTT - Service initialized successfully');
        }
        catch (error) {
            Logger.error('CloudMQTT - Initialization failed, but application will continue', error);
            // Don't throw - allow application to continue without cloud MQTT
            this.initialized = false;
            // Try to reconnect in background
            this._startReconnectLoop();
        }
    }
    /**
     * Start background reconnection loop
     * @private
     */
    _startReconnectLoop() {
        const reconnectInterval = setInterval(async () => {
            if (this.isConnected()) {
                clearInterval(reconnectInterval);
                Logger.info('CloudMQTT - Reconnected successfully');
                this.initialized = true;
                return;
            }
            Logger.info('CloudMQTT - Attempting to reconnect...');
            try {
                await this.connect();
                await this.publishOnlineStatus('true');
                this.initialized = true;
                clearInterval(reconnectInterval);
                Logger.info('CloudMQTT - Reconnected and initialized');
            }
            catch (error) {
                Logger.warn('CloudMQTT - Reconnection attempt failed', error);
            }
        }, 30000); // Try every 30 seconds
    }
    /**
     * Publish online status to cloud
     * @param status - 'true' or 'false'
     */
    async publishOnlineStatus(status) {
        try {
            await this.publish('myFinalProject/server/properties/online', status, { qos: 2, retain: true });
        }
        catch (error) {
            Logger.error('CloudMQTT - Failed to publish online status', error);
            // Don't throw - non-critical error
        }
    }
    /**
     * Check if service is initialized
     * @returns True if initialized
     */
    isInitialized() {
        return this.initialized;
    }
}
exports.CloudMqttService = CloudMqttService;
//# sourceMappingURL=CloudMqttService.js.map