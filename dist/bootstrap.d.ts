/**
 * Application Bootstrap Module
 * Handles initialization of all services and dependencies
 */
import DeviceDataModel from "./models/DeviceDataModel";
import PersonDetectionState from "./models/PersonDetectionState";
import { LocalMqttService } from "./services/mqtt/LocalMqttService";
import { CloudMqttService } from "./services/mqtt/CloudMqttService";
import { MqttMessageHandlerService } from "./services/mqtt/MqttMessageHandlerService";
import { PersonDetectionService } from "./services/PersonDetectionService";
import AirconControllerService from "./services/AirconControllerService";
import RaspberrypiService from "./services/RaspberrypiService";
import MongoDBService from "./services/MongoDBService";
/**
 * Application context containing all initialized services
 */
export interface AppContext {
    deviceModel: DeviceDataModel;
    personDetectionState: PersonDetectionState;
    localMqtt: LocalMqttService;
    cloudMqtt: CloudMqttService;
    mqttMessageHandlerService: MqttMessageHandlerService;
    airconControllerService: AirconControllerService;
    personDetectionService: PersonDetectionService;
    raspberrypiService: RaspberrypiService;
    mongoDBService: MongoDBService;
}
/**
 * Bootstrap and initialize the application
 * @returns Initialized application context
 */
export declare function bootstrap(): Promise<AppContext>;
//# sourceMappingURL=bootstrap.d.ts.map