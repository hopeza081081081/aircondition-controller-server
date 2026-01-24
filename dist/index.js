"use strict";
/**
 * Main Entry Point
 * Orchestrates all modules and starts the application
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
// Load environment variables first
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const config_1 = __importDefault(require("./config"));
const Logger_1 = __importDefault(require("./utils/Logger"));
// Models
const DeviceDataModel_1 = __importDefault(require("./models/DeviceDataModel"));
const PersonDetectionState_1 = __importDefault(require("./models/PersonDetectionState"));
// Services
const LocalMqttService_1 = require("./services/mqtt/LocalMqttService");
const CloudMqttService_1 = require("./services/mqtt/CloudMqttService");
const MqttMessageHandlerService_1 = require("./services/mqtt/MqttMessageHandlerService");
const PersonDetectionService_1 = require("./services/PersonDetectionService");
const RaspberrypiService_1 = __importDefault(require("./services/RaspberrypiService"));
const MongoDBService_1 = __importDefault(require("./services/MongoDBService"));
// Global instances
let deviceModel;
let personDetectionState;
let localMqtt;
let cloudMqtt;
let mqttMessageHandlerService;
let personDetectionService;
let raspberrypiService;
let mongoDBService;
/**
 * Initialize application
 */
async function initialize() {
    try {
        Logger_1.default.info("========================================");
        Logger_1.default.info("Air Conditioning Controller Server");
        Logger_1.default.info("========================================");
        // Initialize models
        Logger_1.default.info("Initializing models...");
        deviceModel = new DeviceDataModel_1.default(config_1.default);
        personDetectionState = new PersonDetectionState_1.default();
        // Initialize MQTT services
        Logger_1.default.info("Initializing MQTT services...");
        localMqtt = new LocalMqttService_1.LocalMqttService(config_1.default.mqtt.local);
        cloudMqtt = new CloudMqttService_1.CloudMqttService(config_1.default.mqtt.cloud);
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
        mqttMessageHandlerService = new MqttMessageHandlerService_1.MqttMessageHandlerService(deviceModel, personDetectionState, cloudMqtt);
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
        // Initialize person detection service
        Logger_1.default.info("Initializing person detection service...");
        personDetectionService = new PersonDetectionService_1.PersonDetectionService(personDetectionState, deviceModel, localMqtt, cloudMqtt, config_1.default);
        // Initialize MongoDB service (non-blocking)
        Logger_1.default.info("Initializing MongoDB service...");
        mongoDBService = new MongoDBService_1.default();
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
        raspberrypiService = new RaspberrypiService_1.default(deviceModel, personDetectionService, localMqtt, cloudMqtt, config_1.default);
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
        // Setup graceful shutdown
        setupGracefulShutdown();
    }
    catch (error) {
        Logger_1.default.error("Failed to initialize application", error);
        process.exit(1);
    }
}
/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown() {
    const shutdown = async (signal) => {
        Logger_1.default.info(`Received ${signal}, shutting down gracefully...`);
        try {
            // Stop device controller
            if (raspberrypiService) {
                raspberrypiService.stop();
                Logger_1.default.info("Device controller stopped");
            }
            // Publish offline status to MQTT
            if (localMqtt && localMqtt.isConnected()) {
                await localMqtt.publishOnlineStatus("false");
                Logger_1.default.info("Published offline status to local MQTT");
            }
            if (cloudMqtt && cloudMqtt.isConnected()) {
                await cloudMqtt.publish("myFinalProject/server/properties/online", "false", { qos: 2, retain: true });
                Logger_1.default.info("Published offline status to cloud MQTT");
            }
            // Disconnect MQTT
            if (localMqtt) {
                localMqtt.disconnect();
            }
            if (cloudMqtt) {
                cloudMqtt.disconnect();
            }
            // Stop MongoDB service
            if (mongoDBService) {
                await mongoDBService.stopPeriodicSaving();
                await mongoDBService.disconnect();
                Logger_1.default.info("MongoDB service stopped");
            }
            Logger_1.default.info("Shutdown complete");
            process.exit(0);
        }
        catch (error) {
            Logger_1.default.error("Error during shutdown", error);
            process.exit(1);
        }
    };
    // Handle signals
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
        Logger_1.default.error("Uncaught exception", error);
        shutdown("uncaughtException");
    });
    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason) => {
        Logger_1.default.error("Unhandled promise rejection", reason);
        shutdown("unhandledRejection");
    });
}
// Start the application
initialize();
//# sourceMappingURL=index.js.map