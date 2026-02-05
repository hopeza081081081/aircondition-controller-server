/**
 * Service Interfaces
 * Defines contracts for all major services in the application
 */
import { SubscriptionConfig } from "../types";
/**
 * Base MQTT Service Interface
 * Common contract for Local and Cloud MQTT services
 */
export interface IMqttService {
    /**
     * Initialize the MQTT service
     */
    initialize(): Promise<void>;
    /**
     * Publish a message to a topic
     * @param topic - MQTT topic
     * @param message - Message payload
     * @param options - Publish options (qos, retain, etc.)
     */
    publish(topic: string, message: string, options?: any): Promise<void>;
    /**
     * Subscribe to topics
     * @param config - Subscription configuration
     */
    subscribe(config: SubscriptionConfig): Promise<void>;
    /**
     * Disconnect from MQTT broker
     */
    disconnect(): void;
    /**
     * Check if connected to broker
     */
    isConnected(): boolean;
    /**
     * Check if service is initialized
     */
    isInitialized(): boolean;
}
/**
 * Aircon Controller Service Interface
 */
export interface IAirconControllerService {
    /**
     * Set all aircon controllers to a specific state
     */
    setAllControllers(command: boolean, reason: string): Promise<void>;
    /**
     * Set a single aircon controller
     */
    setSingleController(controllerId: number, command: boolean, reason: string): Promise<void>;
    /**
     * Turn off all aircon controllers
     */
    turnOffAll(reason: string): Promise<void>;
    /**
     * Turn on all aircon controllers
     */
    turnOnAll(reason: string): Promise<void>;
}
/**
 * Person Detection Service Interface
 */
export interface IPersonDetectionService {
    /**
     * Execute person detection logic
     */
    execute(): Promise<void>;
}
/**
 * Raspberry Pi Service Interface
 */
export interface IRaspberrypiService {
    /**
     * Start the device controller
     */
    start(): void;
    /**
     * Stop the device controller
     */
    stop(): void;
    /**
     * Check if controller is running
     */
    isRunning(): boolean;
}
/**
 * MongoDB Service Interface
 */
export interface IMongoDBService {
    /**
     * Connect to MongoDB
     */
    connect(): Promise<void>;
    /**
     * Disconnect from MongoDB
     */
    disconnect(): Promise<void>;
    /**
     * Start periodic data saving
     */
    startPeriodicSaving(dataGetter: () => any): void;
    /**
     * Stop periodic data saving
     */
    stopPeriodicSaving(): Promise<void>;
    /**
     * Check if connection is active
     */
    isConnectionActive(): boolean;
}
//# sourceMappingURL=index.d.ts.map