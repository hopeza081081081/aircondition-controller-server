/**
 * Application Constants
 * Centralized constants to avoid magic numbers throughout the codebase
 */
/**
 * MQTT Configuration Constants
 */
export declare const MQTT_CONFIG: {
    /** Reconnection retry interval in milliseconds (30 seconds) */
    readonly RECONNECT_INTERVAL: 30000;
    /** Maximum number of retry attempts for MQTT publish operations */
    readonly MAX_RETRY_ATTEMPTS: 3;
    /** Base for exponential backoff calculation (seconds) */
    readonly RETRY_BACKOFF_BASE: 2;
};
/**
 * Air Conditioner Controller Configuration
 */
export declare const AIRCON_CONFIG: {
    /** Number of aircon controllers in the system */
    readonly CONTROLLER_COUNT: 3;
    /** Default power-off duration in milliseconds (5 minutes) */
    readonly DEFAULT_POWER_OFF_DURATION: 300000;
};
/**
 * RPI (Raspberry Pi) Configuration
 */
export declare const RPI_CONFIG: {
    /** Default RPI count */
    readonly DEFAULT_COUNT: 2;
};
/**
 * MQTT Topics
 */
export declare const MQTT_TOPICS: {
    /** Server online status topic */
    readonly SERVER_ONLINE_STATUS: "myFinalProject/server/properties/online";
    /** Base topic for aircon controller commands */
    readonly AIRCON_COMMAND_BASE: "myFinalProject/server/airconController";
};
/**
 * Default QoS levels for MQTT
 */
export declare const MQTT_QOS: {
    /** At most once delivery */
    readonly AT_MOST_ONCE: 0;
    /** At least once delivery */
    readonly AT_LEAST_ONCE: 1;
    /** Exactly once delivery */
    readonly EXACTLY_ONCE: 2;
};
//# sourceMappingURL=constants.d.ts.map