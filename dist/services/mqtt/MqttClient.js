"use strict";
/**
 * MQTT Client Base Class
 * Generic MQTT client with connection management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttClient = void 0;
const mqtt = __importStar(require("mqtt"));
const Logger = require('../../utils/Logger');
class MqttClient {
    constructor(config, clientName) {
        this.config = config;
        this.clientName = clientName;
        this.client = null;
        this.manualDisconnect = false;
        Logger.info(`${this.clientName} - MQTT client initialized`, {
            host: config.host,
            port: config.port
        });
    }
    /**
     * Connect to MQTT broker
     */
    async connect() {
        return new Promise((resolve, reject) => {
            Logger.info(`${this.clientName} - Connecting to MQTT broker`, {
                host: this.config.host,
                port: this.config.port
            });
            this.client = mqtt.connect(this.config);
            this.client.on('connect', () => {
                Logger.info(`${this.clientName} - Connected to MQTT broker`);
                resolve();
            });
            this.client.on('error', (error) => {
                Logger.error(`${this.clientName} - MQTT connection error`, error);
                reject(error);
            });
            this.client.on('offline', () => {
                Logger.warn(`${this.clientName} - MQTT broker offline`);
            });
            this.client.on('reconnect', () => {
                Logger.info(`${this.clientName} - Reconnecting to MQTT broker`);
            });
            // Set timeout for connection
            setTimeout(() => {
                if (!this.client || !this.client.connected) {
                    reject(new Error(`${this.clientName} - Connection timeout`));
                }
            }, 30000);
        });
    }
    /**
     * Register event handler
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    on(event, handler) {
        if (this.client) {
            this.client.on(event, handler);
        }
    }
    /**
     * Publish message to topic
     * @param {string} topic - MQTT topic
     * @param {string} message - Message to publish
     * @param {PublishOptions} options - Publish options {qos, retain}
     */
    async publish(topic, message, options = { qos: 0, retain: false }) {
        return new Promise((resolve, reject) => {
            if (!this.client || !this.client.connected) {
                Logger.warn(`${this.clientName} - Not connected, cannot publish to ${topic}`);
                reject(new Error('Not connected'));
                return;
            }
            this.client.publish(topic, message, options, (error) => {
                if (error) {
                    Logger.error(`${this.clientName} - Publish error`, error, { topic });
                    reject(error);
                }
                else {
                    Logger.debug(`${this.clientName} - Message published`, { topic, message });
                    resolve();
                }
            });
        });
    }
    /**
     * Subscribe to topics
     * @param {{ [topic: string]: { qos: number } }} topics - Topics to subscribe
     */
    async subscribe(topics) {
        return new Promise((resolve, reject) => {
            if (!this.client || !this.client.connected) {
                Logger.warn(`${this.clientName} - Not connected, cannot subscribe`);
                reject(new Error('Not connected'));
                return;
            }
            this.client.subscribe(topics, (error) => {
                if (error) {
                    Logger.error(`${this.clientName} - Subscribe error`, error);
                    reject(error);
                }
                else {
                    Logger.info(`${this.clientName} - Subscribed to topics`, { topics });
                    resolve();
                }
            });
        });
    }
    /**
     * Check if connected
     * @returns {boolean} Connection status
     */
    isConnected() {
        return this.client !== null && this.client.connected;
    }
    /**
     * Disconnect from broker
     */
    disconnect() {
        this.manualDisconnect = true;
        if (this.client) {
            this.client.end();
            Logger.info(`${this.clientName} - Disconnected from MQTT broker`);
        }
    }
}
exports.MqttClient = MqttClient;
//# sourceMappingURL=MqttClient.js.map