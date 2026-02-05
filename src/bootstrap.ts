/**
 * Application Bootstrap Module
 * Handles initialization of all services and dependencies
 */

import config, { airconControllerConfig } from "./config";
import Logger from "./utils/Logger";

// Models
import DeviceDataModel from "./models/DeviceDataModel";
import PersonDetectionState from "./models/PersonDetectionState";

// Services
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
export async function bootstrap(): Promise<AppContext> {
  try {
    Logger.info("========================================");
    Logger.info("Air Conditioning Controller Server");
    Logger.info("========================================");

    // Initialize models
    Logger.info("Initializing models...");
    const deviceModel = new DeviceDataModel(config);
    const personDetectionState = new PersonDetectionState();

    // Initialize MQTT services
    Logger.info("Initializing MQTT services...");
    const localMqtt = new LocalMqttService(
      config.mqtt.local,
      airconControllerConfig,
    );
    const cloudMqtt = new CloudMqttService(config.mqtt.cloud);

    // Connect to MQTT brokers (non-blocking - won't crash if connection fails)
    await localMqtt.initialize();
    await cloudMqtt.initialize();

    // Setup local MQTT subscriptions only if connected
    if (localMqtt.isInitialized()) {
      try {
        await localMqtt.setupSubscriptions(config.subscriptions);
      } catch (error) {
        Logger.warn("Failed to setup MQTT subscriptions", error as Error);
      }
    }

    // Initialize message handler
    Logger.info("Initializing message handler...");
    const mqttMessageHandlerService = new MqttMessageHandlerService(
      deviceModel,
      personDetectionState,
      cloudMqtt,
    );

    // Wire up MQTT message events only if local MQTT is connected
    if (localMqtt.isInitialized() && localMqtt.isConnected()) {
      localMqtt.on("message", (topic: string, message: Buffer) => {
        mqttMessageHandlerService.handle(topic, message);
      });
      Logger.info("Local MQTT message handler registered");
    } else {
      Logger.warn("Local MQTT not connected - message handling disabled");
    }

    // Initialize aircon controller service
    Logger.info("Initializing aircon controller service...");
    const airconControllerService = new AirconControllerService(
      deviceModel,
      localMqtt,
      cloudMqtt,
    );

    // Initialize person detection service
    Logger.info("Initializing person detection service...");
    const personDetectionService = new PersonDetectionService(
      personDetectionState,
      airconControllerService,
      config,
    );

    // Initialize MongoDB service (non-blocking)
    Logger.info("Initializing MongoDB service...");
    const mongoDBService = new MongoDBService();

    try {
      await mongoDBService.connect();

      // Start periodic data saving
      mongoDBService.startPeriodicSaving(() => deviceModel.getDeviceState());
      Logger.info("MongoDB periodic saving started");
    } catch (error) {
      Logger.error(
        "Failed to connect to MongoDB, but application will continue",
        error as Error,
      );
      Logger.warn("MongoDB features will be disabled");
    }

    // Initialize device controller
    Logger.info("Initializing device controller...");
    const raspberrypiService = new RaspberrypiService(
      deviceModel,
      personDetectionService,
      airconControllerService,
      config,
    );

    // Start device controller
    raspberrypiService.start();

    Logger.info("========================================");
    Logger.info("Application started successfully");
    Logger.info("========================================");
    Logger.info("MQTT Status:");
    Logger.info(
      `  Local MQTT: ${localMqtt.isInitialized() ? "✓ Connected" : "✗ Disconnected (will retry in background)"}`,
    );
    Logger.info(
      `  Cloud MQTT: ${cloudMqtt.isInitialized() ? "✓ Connected" : "✗ Disconnected (will retry in background)"}`,
    );
    Logger.info("MongoDB Status:");
    Logger.info(
      `  MongoDB: ${mongoDBService.isConnectionActive() ? "✓ Connected" : "✗ Disconnected (data saving disabled)"}`,
    );
    Logger.info("========================================");

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
  } catch (error) {
    Logger.error("Failed to initialize application", error as Error);
    process.exit(1);
  }
}
