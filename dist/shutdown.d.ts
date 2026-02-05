/**
 * Graceful Shutdown Module
 * Handles application cleanup and shutdown procedures
 */
import { LocalMqttService } from "./services/mqtt/LocalMqttService";
import { CloudMqttService } from "./services/mqtt/CloudMqttService";
import RaspberrypiService from "./services/RaspberrypiService";
import MongoDBService from "./services/MongoDBService";
/**
 * Handles for services that need cleanup
 */
export interface ShutdownHandles {
    raspberrypiService: RaspberrypiService;
    localMqtt: LocalMqttService;
    cloudMqtt: CloudMqttService;
    mongoDBService: MongoDBService;
}
/**
 * Setup graceful shutdown handlers for the application
 * @param handles - Service instances that need cleanup
 */
export declare function setupGracefulShutdown(handles: ShutdownHandles): void;
//# sourceMappingURL=shutdown.d.ts.map