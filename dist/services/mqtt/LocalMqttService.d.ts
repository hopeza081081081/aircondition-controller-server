/**
 * Local MQTT Service
 * Manages local MQTT broker connection
 */
import { MqttClient } from './MqttClient';
import { MqttConfig, SubscriptionConfig } from '../../types';
export declare class LocalMqttService extends MqttClient {
    private initialized;
    private reconnectInterval;
    constructor(config: MqttConfig);
    /**
     * Initialize local MQTT service (non-blocking)
     * Connection failures won't crash the application
     */
    initialize(): Promise<void>;
    /**
     * Start background reconnection loop
     * @private
     */
    private _startReconnectLoop;
    /**
     * Clear reconnect interval
     * @private
     */
    private _clearReconnectInterval;
    /**
     * Disconnect and cleanup
     */
    disconnect(): void;
    /**
     * Publish server online status
     * @param status - 'true' or 'false'
     */
    publishOnlineStatus(status: string): Promise<void>;
    /**
     * Publish command to aircon controller with retry
     * @param controllerId - Controller ID (1, 2, or 3)
     * @param command - Command ('true' or 'false')
     */
    publishCommand(controllerId: number, command: string): Promise<void>;
    /**
     * Setup subscriptions
     * @param subscriptionConfig - Subscription configuration
     */
    setupSubscriptions(subscriptionConfig: SubscriptionConfig): Promise<void>;
    /**
     * Check if service is initialized
     * @returns True if initialized
     */
    isInitialized(): boolean;
}
//# sourceMappingURL=LocalMqttService.d.ts.map