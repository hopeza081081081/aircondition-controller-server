"use strict";
/**
 * Application Bootstrap Module
 * Handles initialization of all services and dependencies
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = bootstrap;
const config_1 = __importStar(require("./config"));
const Logger_1 = __importDefault(require("./utils/Logger"));
// Models
const DeviceDataModel_1 = __importDefault(require("./models/DeviceDataModel"));
const PersonDetectionState_1 = __importDefault(require("./models/PersonDetectionState"));
// Services
const LocalMqttService_1 = require("./services/mqtt/LocalMqttService");
const CloudMqttService_1 = require("./services/mqtt/CloudMqttService");
const MqttMessageHandlerService_1 = require("./services/mqtt/MqttMessageHandlerService");
const PersonDetectionService_1 = require("./services/PersonDetectionService");
const AirconControllerService_1 = __importDefault(require("./services/AirconControllerService"));
const RaspberrypiService_1 = __importDefault(require("./services/RaspberrypiService"));
const MongoDBService_1 = __importDefault(require("./services/MongoDBService"));
/**
 * Bootstrap and initialize the application
 * @returns Initialized application context
 */
async function bootstrap() {
    try {
        Logger_1.default.info("========================================");
        Logger_1.default.info("Air Conditioning Controller Server");
        Logger_1.default.info("========================================");
        // Initialize models
        Logger_1.default.info("Initializing models...");
        const deviceModel = new DeviceDataModel_1.default(config_1.default);
        const personDetectionState = new PersonDetectionState_1.default();
        // Initialize MQTT services
        Logger_1.default.info("Initializing MQTT services...");
        const localMqtt = new LocalMqttService_1.LocalMqttService(config_1.default.mqtt.local, config_1.airconControllerConfig);
        const cloudMqtt = new CloudMqttService_1.CloudMqttService(config_1.default.mqtt.cloud);
        // Connect to MQTT brokers (non-blocking - won't crash if connection fails)
        await localMqtt.initialize();
        await cloudMqtt.initialize();
        // Setup local MQTT subscriptions only if connected
        if (localMqtt.isInitialized()) {
            try {
                await localMqtt.setupSubscriptions(config_1.default.subscriptions);
            }
            catch (error) {
                Logger_1.default.warn("Failed to setup MQTT subscriptions", error);
            }
        }
        // Initialize message handler
        Logger_1.default.info("Initializing message handler...");
        const mqttMessageHandlerService = new MqttMessageHandlerService_1.MqttMessageHandlerService(deviceModel, personDetectionState, cloudMqtt);
        // Wire up MQTT message events only if local MQTT is connected
        if (localMqtt.isInitialized() && localMqtt.isConnected()) {
            localMqtt.on("message", (topic, message) => {
                mqttMessageHandlerService.handle(topic, message);
            });
            Logger_1.default.info("Local MQTT message handler registered");
        }
        else {
            Logger_1.default.warn("Local MQTT not connected - message handling disabled");
        }
        // Initialize aircon controller service
        Logger_1.default.info("Initializing aircon controller service...");
        const airconControllerService = new AirconControllerService_1.default(deviceModel, localMqtt, cloudMqtt);
        // Initialize person detection service
        Logger_1.default.info("Initializing person detection service...");
        const personDetectionService = new PersonDetectionService_1.PersonDetectionService(personDetectionState, airconControllerService, config_1.default);
        // Initialize MongoDB service (non-blocking)
        Logger_1.default.info("Initializing MongoDB service...");
        const mongoDBService = new MongoDBService_1.default();
        try {
            await mongoDBService.connect();
            // Start periodic data saving
            mongoDBService.startPeriodicSaving(() => deviceModel.getDeviceState());
            Logger_1.default.info("MongoDB periodic saving started");
        }
        catch (error) {
            Logger_1.default.error("Failed to connect to MongoDB, but application will continue", error);
            Logger_1.default.warn("MongoDB features will be disabled");
        }
        // Initialize device controller
        Logger_1.default.info("Initializing device controller...");
        const raspberrypiService = new RaspberrypiService_1.default(deviceModel, personDetectionService, airconControllerService, config_1.default);
        // Start device controller
        raspberrypiService.start();
        Logger_1.default.info("========================================");
        Logger_1.default.info("Application started successfully");
        Logger_1.default.info("========================================");
        Logger_1.default.info("MQTT Status:");
        Logger_1.default.info(`  Local MQTT: ${localMqtt.isInitialized() ? "✓ Connected" : "✗ Disconnected (will retry in background)"}`);
        Logger_1.default.info(`  Cloud MQTT: ${cloudMqtt.isInitialized() ? "✓ Connected" : "✗ Disconnected (will retry in background)"}`);
        Logger_1.default.info("MongoDB Status:");
        Logger_1.default.info(`  MongoDB: ${mongoDBService.isConnectionActive() ? "✓ Connected" : "✗ Disconnected (data saving disabled)"}`);
        Logger_1.default.info("========================================");
        return {
            deviceModel,
            personDetectionState,
            localMqtt,
            cloudMqtt,
            mqttMessageHandlerService,
            airconControllerService,
            personDetectionService,
            raspberrypiService,
            mongoDBService,
        };
    }
    catch (error) {
        Logger_1.default.error("Failed to initialize application", error);
        process.exit(1);
    }
}
//# sourceMappingURL=bootstrap.js.map