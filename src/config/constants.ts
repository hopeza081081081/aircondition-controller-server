/**
 * Application Constants
 * Centralized constants to avoid magic numbers throughout the codebase
 */

/**
 * MQTT Configuration Constants
 */
export const MQTT_CONFIG = {
  /** Reconnection retry interval in milliseconds (30 seconds) */
  RECONNECT_INTERVAL: 30000,

  /** Maximum number of retry attempts for MQTT publish operations */
  MAX_RETRY_ATTEMPTS: 3,

  /** Base for exponential backoff calculation (seconds) */
  RETRY_BACKOFF_BASE: 2,
} as const;

/**
 * Air Conditioner Controller Configuration
 */
export const AIRCON_CONFIG = {
  /** Number of aircon controllers in the system */
  CONTROLLER_COUNT: 3,

  /** Default power-off duration in milliseconds (5 minutes) */
  DEFAULT_POWER_OFF_DURATION: 300000,
} as const;

/**
 * RPI (Raspberry Pi) Configuration
 */
export const RPI_CONFIG = {
  /** Default RPI count */
  DEFAULT_COUNT: 2,
} as const;

/**
 * MQTT Topics
 */
export const MQTT_TOPICS = {
  /** Server online status topic */
  SERVER_ONLINE_STATUS: "myFinalProject/server/properties/online",

  /** Base topic for aircon controller commands */
  AIRCON_COMMAND_BASE: "myFinalProject/server/airconController",
} as const;

/**
 * Default QoS levels for MQTT
 */
export const MQTT_QOS = {
  /** At most once delivery */
  AT_MOST_ONCE: 0,

  /** At least once delivery */
  AT_LEAST_ONCE: 1,

  /** Exactly once delivery */
  EXACTLY_ONCE: 2,
} as const;
