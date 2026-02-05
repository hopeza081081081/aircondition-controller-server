"use strict";
/**
 * Application Constants
 * Centralized constants to avoid magic numbers throughout the codebase
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MQTT_QOS = exports.MQTT_TOPICS = exports.RPI_CONFIG = exports.AIRCON_CONFIG = exports.MQTT_CONFIG = void 0;
/**
 * MQTT Configuration Constants
 */
exports.MQTT_CONFIG = {
    /** Reconnection retry interval in milliseconds (30 seconds) */
    RECONNECT_INTERVAL: 30000,
    /** Maximum number of retry attempts for MQTT publish operations */
    MAX_RETRY_ATTEMPTS: 3,
    /** Base for exponential backoff calculation (seconds) */
    RETRY_BACKOFF_BASE: 2,
};
/**
 * Air Conditioner Controller Configuration
 */
exports.AIRCON_CONFIG = {
    /** Number of aircon controllers in the system */
    CONTROLLER_COUNT: 3,
    /** Default power-off duration in milliseconds (5 minutes) */
    DEFAULT_POWER_OFF_DURATION: 300000,
};
/**
 * RPI (Raspberry Pi) Configuration
 */
exports.RPI_CONFIG = {
    /** Default RPI count */
    DEFAULT_COUNT: 2,
};
/**
 * MQTT Topics
 */
exports.MQTT_TOPICS = {
    /** Server online status topic */
    SERVER_ONLINE_STATUS: "myFinalProject/server/properties/online",
    /** Base topic for aircon controller commands */
    AIRCON_COMMAND_BASE: "myFinalProject/server/airconController",
};
/**
 * Default QoS levels for MQTT
 */
exports.MQTT_QOS = {
    /** At most once delivery */
    AT_MOST_ONCE: 0,
    /** At least once delivery */
    AT_LEAST_ONCE: 1,
    /** Exactly once delivery */
    EXACTLY_ONCE: 2,
};
//# sourceMappingURL=constants.js.map