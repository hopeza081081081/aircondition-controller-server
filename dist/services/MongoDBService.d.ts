/**
 * MongoDB Service
 * Handles MongoDB operations using async/await (no worker threads)
 */
import { DeviceDataState } from '../types';
export declare class MongoDBService {
    private mongoUrl;
    private dataPushingInterval;
    isConnected: boolean;
    private saveInterval;
    constructor();
    /**
     * Connect to MongoDB
     */
    connect(): Promise<boolean>;
    /**
     * Setup MongoDB connection event handlers
     * @private
     */
    private _setupEventHandlers;
    /**
     * Start periodic data saving
     * @param dataCallback - Callback function to get device data
     */
    startPeriodicSaving(dataCallback: () => DeviceDataState): void;
    /**
     * Stop periodic data saving
     */
    stopPeriodicSaving(): void;
    /**
     * Save device data to MongoDB
     * @param deviceDataModel - Device data model
     */
    saveDeviceData(deviceDataModel: DeviceDataState): Promise<void>;
    /**
     * Disconnect from MongoDB
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected to MongoDB
     * @returns True if connected
     */
    isConnectionActive(): boolean;
}
export default MongoDBService;
//# sourceMappingURL=MongoDBService.d.ts.map