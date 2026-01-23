/**
 * Cloud MQTT Service
 * Manages cloud MQTT broker connection for data relay
 * Simplified - uses generic publish method
 */
import { MqttClient } from './MqttClient';
import { MqttConfig } from '../../types';
export declare class CloudMqttService extends MqttClient {
    private initialized;
    constructor(config: MqttConfig);
    /**
     * Initialize cloud MQTT service (non-blocking)
     * Connection failures won't crash the application
     */
    initialize(): Promise<void>;
    /**
     * Start background reconnection loop
     * @private
     */
    private _startReconnectLoop;
    /**
     * Publish online status to cloud
     * @param status - 'true' or 'false'
     */
    publishOnlineStatus(status: string): Promise<void>;
    /**
     * Check if service is initialized
     * @returns True if initialized
     */
    isInitialized(): boolean;
}
//# sourceMappingURL=CloudMqttService.d.ts.map