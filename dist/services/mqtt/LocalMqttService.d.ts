/**
 * Local MQTT Service
 * Manages local MQTT broker connection
 */
import { MqttClient } from './MqttClient';
import { MqttConfig, SubscriptionConfig, AirconMappingConfig } from '../../types';
export declare class LocalMqttService extends MqttClient {
    private initialized;
    private reconnectInterval;
    private airconMapper;
    constructor(config: MqttConfig, airconConfig?: AirconMappingConfig[]);
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
     * @param controllerId - Controller ID (0, 1, or 2 - internal index)
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
    /**
     * Get aircon controller identifier by index
     * @param controllerId - Controller index (0, 1, 2, etc.)
     * @returns Identifier string (e.g., 'aircon_8CAAB5936934') or empty string if not found
     */
    getAirconIdentifier(controllerId: number): string;
    /**
     * Get aircon controller index from topic
     * @param topic - MQTT topic string
     * @returns Controller index (0, 1, 2, etc.) or -1 if not found
     */
    getAirconControllerId(topic: string): number;
}
//# sourceMappingURL=LocalMqttService.d.ts.map