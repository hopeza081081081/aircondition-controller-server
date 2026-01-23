/**
 * MQTT Client Base Class
 * Generic MQTT client with connection management
 */
import * as mqtt from 'mqtt';
import { MqttConfig, PublishOptions } from '../../types';
export declare class MqttClient {
    protected config: MqttConfig;
    protected clientName: string;
    protected client: mqtt.MqttClient | null;
    protected manualDisconnect: boolean;
    constructor(config: MqttConfig, clientName: string);
    /**
     * Connect to MQTT broker
     */
    connect(): Promise<void>;
    /**
     * Register event handler
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    on(event: string, handler: (...args: any[]) => void): void;
    /**
     * Publish message to topic
     * @param {string} topic - MQTT topic
     * @param {string} message - Message to publish
     * @param {PublishOptions} options - Publish options {qos, retain}
     */
    publish(topic: string, message: string, options?: PublishOptions): Promise<void>;
    /**
     * Subscribe to topics
     * @param {{ [topic: string]: { qos: number } }} topics - Topics to subscribe
     */
    subscribe(topics: {
        [topic: string]: {
            qos: number;
        };
    }): Promise<void>;
    /**
     * Check if connected
     * @returns {boolean} Connection status
     */
    isConnected(): boolean;
    /**
     * Disconnect from broker
     */
    disconnect(): void;
}
//# sourceMappingURL=MqttClient.d.ts.map