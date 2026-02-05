"use strict";
/**
 * Local MQTT Service
 * Manages local MQTT broker connection
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalMqttService = void 0;
const MqttClient_1 = require("./MqttClient");
const AirconTopicMapper_1 = __importDefault(require("../../utils/AirconTopicMapper"));
const constants_1 = require("../../config/constants");
const Logger = require("../../utils/Logger");
class LocalMqttService extends MqttClient_1.MqttClient {
    constructor(config, airconConfig) {
        super(config, "LocalMQTT");
        this.initialized = false;
        this.reconnectInterval = null;
        this.airconMapper = new AirconTopicMapper_1.default(airconConfig);
    }
    /**
     * Initialize local MQTT service (non-blocking)
     * Connection failures won't crash the application
     */
    async initialize() {
        try {
            await this.connect();
            // Publish online status
            await this.publishOnlineStatus("true");
            // Initialize aircon controller commands to false
            for (let i = 0; i < constants_1.AIRCON_CONFIG.CONTROLLER_COUNT; i++) {
                await this.publishCommand(i, "false");
            }
            this.initialized = true;
            Logger.info("LocalMQTT - Service initialized successfully");
        }
        catch (error) {
            Logger.error("LocalMQTT - Initialization failed, but application will continue", error);
            // Don't throw - allow application to continue without local MQTT
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
        // Clear existing interval if any (prevent memory leak)
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            Logger.debug("LocalMQTT - Cleared previous reconnect interval");
        }
        this.reconnectInterval = setInterval(async () => {
            if (this.isConnected()) {
                this._clearReconnectInterval();
                Logger.info("LocalMQTT - Reconnected successfully");
                this.initialized = true;
                return;
            }
            Logger.info("LocalMQTT - Attempting to reconnect...");
            try {
                await this.connect();
                await this.publishOnlineStatus("true");
                for (let i = 0; i < constants_1.AIRCON_CONFIG.CONTROLLER_COUNT; i++) {
                    await this.publishCommand(i, "false");
                }
                this.initialized = true;
                this._clearReconnectInterval();
                Logger.info("LocalMQTT - Reconnected and initialized");
            }
            catch (error) {
                Logger.warn("LocalMQTT - Reconnection attempt failed", error);
            }
        }, constants_1.MQTT_CONFIG.RECONNECT_INTERVAL);
        Logger.debug("LocalMQTT - Reconnect loop started");
    }
    /**
     * Clear reconnect interval
     * @private
     */
    _clearReconnectInterval() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
            Logger.debug("LocalMQTT - Reconnect interval cleared");
        }
    }
    /**
     * Disconnect and cleanup
     */
    disconnect() {
        this._clearReconnectInterval();
        super.disconnect();
        Logger.info("LocalMQTT - Disconnected and cleaned up");
    }
    /**
     * Publish server online status
     * @param status - 'true' or 'false'
     */
    async publishOnlineStatus(status) {
        try {
            await this.publish(constants_1.MQTT_TOPICS.SERVER_ONLINE_STATUS, status, {
                qos: constants_1.MQTT_QOS.EXACTLY_ONCE,
                retain: true,
            });
        }
        catch (error) {
            Logger.error("LocalMQTT - Failed to publish online status", error);
            // Don't throw - non-critical error
        }
    }
    /**
     * Publish command to aircon controller with retry
     * @param controllerId - Controller ID (0, 1, or 2 - internal index)
     * @param command - Command ('true' or 'false')
     */
    async publishCommand(controllerId, command) {
        // Get the identifier for this controller (e.g., 'aircon_8CAAB5936934')
        const identifier = this.airconMapper.getIdentifier(controllerId);
        if (!identifier) {
            Logger.error(`LocalMQTT - No identifier found for controller index ${controllerId}`);
            return;
        }
        // Use new topic format: myFinalProject/server/airconController/aircon_XXXX/command
        const topic = `${constants_1.MQTT_TOPICS.AIRCON_COMMAND_BASE}/${identifier}/command`;
        const maxRetries = constants_1.MQTT_CONFIG.MAX_RETRY_ATTEMPTS;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.publish(topic, command, {
                    qos: constants_1.MQTT_QOS.EXACTLY_ONCE,
                    retain: true,
                });
                Logger.debug(`LocalMQTT - Command sent to controller ${identifier} (index ${controllerId}): ${command}`);
                return;
            }
            catch (error) {
                Logger.warn(`LocalMQTT - Publish attempt ${attempt} failed for controller ${identifier}`, error);
                if (attempt === maxRetries) {
                    Logger.error(`LocalMQTT - Failed to publish command to controller ${identifier} after ${maxRetries} attempts`, error);
                    return; // Don't throw - allow system to continue
                }
                // Wait before retry (exponential backoff)
                await new Promise((resolve) => setTimeout(resolve, Math.pow(constants_1.MQTT_CONFIG.RETRY_BACKOFF_BASE, attempt) * 1000));
            }
        }
    }
    /**
     * Setup subscriptions
     * @param subscriptionConfig - Subscription configuration
     */
    async setupSubscriptions(subscriptionConfig) {
        try {
            await this.subscribe(subscriptionConfig);
            Logger.info("LocalMQTT - Subscriptions setup complete");
        }
        catch (error) {
            Logger.error("LocalMQTT - Failed to setup subscriptions", error);
            throw error;
        }
    }
    /**
     * Check if service is initialized
     * @returns True if initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Get aircon controller identifier by index
     * @param controllerId - Controller index (0, 1, 2, etc.)
     * @returns Identifier string (e.g., 'aircon_8CAAB5936934') or empty string if not found
     */
    getAirconIdentifier(controllerId) {
        return this.airconMapper.getIdentifier(controllerId);
    }
    /**
     * Get aircon controller index from topic
     * @param topic - MQTT topic string
     * @returns Controller index (0, 1, 2, etc.) or -1 if not found
     */
    getAirconControllerId(topic) {
        return this.airconMapper.getControllerId(topic);
    }
}
exports.LocalMqttService = LocalMqttService;
//# sourceMappingURL=LocalMqttService.js.map