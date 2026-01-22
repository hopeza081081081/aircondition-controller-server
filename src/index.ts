/**
 * Main Entry Point
 * Orchestrates all modules and starts the application
 */

// Load environment variables first
import * as dotenv from 'dotenv';
dotenv.config();

import config from './config';
import Logger from './utils/Logger';

// Models
import DeviceDataModel from './models/DeviceDataModel';
import PersonDetectionState from './models/PersonDetectionState';

// Services
import { LocalMqttService } from './services/mqtt/LocalMqttService';
import { CloudMqttService } from './services/mqtt/CloudMqttService';
import { MessageHandler } from './services/mqtt/MessageHandler';
import { PersonDetectionService } from './services/PersonDetectionService';
import RaspberrypiService from './services/RaspberrypiService';
import MongoDBService from './services/MongoDBService';

// Global instances
let deviceModel: DeviceDataModel;
let personDetectionState: PersonDetectionState;
let localMqtt: LocalMqttService;
let cloudMqtt: CloudMqttService;
let mqttMessageHandlerService: MessageHandler;
let personDetectionService: PersonDetectionService;
let raspberrypiService: RaspberrypiService;
let mongoDBService: MongoDBService;

/**
 * Initialize application
 */
async function initialize(): Promise<void> {
  try {
    Logger.info('========================================');
    Logger.info('Air Conditioning Controller Server');
    Logger.info('========================================');

    // Initialize models
    Logger.info('Initializing models...');
    deviceModel = new DeviceDataModel(config);
    personDetectionState = new PersonDetectionState();

    // Initialize MQTT services
    Logger.info('Initializing MQTT services...');
    localMqtt = new LocalMqttService(config.mqtt.local);
    cloudMqtt = new CloudMqttService(config.mqtt.cloud);

    // Connect to MQTT brokers (non-blocking - won't crash if connection fails)
    await localMqtt.initialize();
    await cloudMqtt.initialize();

    // Setup local MQTT subscriptions only if connected
    if (localMqtt.isInitialized()) {
      try {
        await localMqtt.setupSubscriptions(config.subscriptions);
      } catch (error) {
        Logger.warn('Failed to setup MQTT subscriptions', error as Error);
      }
    }

    // Initialize message handler
    Logger.info('Initializing message handler...');
    mqttMessageHandlerService = new MessageHandler(deviceModel, cloudMqtt);

    // Wire up MQTT message events only if local MQTT is connected
    if (localMqtt.isInitialized() && localMqtt.isConnected()) {
      localMqtt.on('message', (topic: string, message: Buffer) => {
        mqttMessageHandlerService.handle(topic, message);
      });
      Logger.info('Local MQTT message handler registered');
    } else {
      Logger.warn('Local MQTT not connected - message handling disabled');
    }

    // Initialize person detection service
    Logger.info('Initializing person detection service...');
    personDetectionService = new PersonDetectionService(
      personDetectionState,
      deviceModel,
      localMqtt,
      cloudMqtt,
      config
    );

    // Initialize MongoDB service (non-blocking)
    Logger.info('Initializing MongoDB service...');
    mongoDBService = new MongoDBService();

    try {
      await mongoDBService.connect();

      // Start periodic data saving
      mongoDBService.startPeriodicSaving(() => deviceModel.getDeviceState());
      Logger.info('MongoDB periodic saving started');
    } catch (error) {
      Logger.error('Failed to connect to MongoDB, but application will continue', error as Error);
      Logger.warn('MongoDB features will be disabled');
    }

    // Initialize device controller
    Logger.info('Initializing device controller...');
    raspberrypiService = new RaspberrypiService(
      deviceModel,
      personDetectionService,
      localMqtt,
      cloudMqtt,
      config
    );

    // Start device controller
    raspberrypiService.start();

    Logger.info('========================================');
    Logger.info('Application started successfully');
    Logger.info('========================================');
    Logger.info('MQTT Status:');
    Logger.info(`  Local MQTT: ${localMqtt.isInitialized() ? '✓ Connected' : '✗ Disconnected (will retry in background)'}`);
    Logger.info(`  Cloud MQTT: ${cloudMqtt.isInitialized() ? '✓ Connected' : '✗ Disconnected (will retry in background)'}`);
    Logger.info('MongoDB Status:');
    Logger.info(`  MongoDB: ${mongoDBService.isConnectionActive() ? '✓ Connected' : '✗ Disconnected (data saving disabled)'}`);
    Logger.info('========================================');

    // Setup graceful shutdown
    setupGracefulShutdown();

  } catch (error) {
    Logger.error('Failed to initialize application', error as Error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(): void {
  const shutdown = async (signal: string): Promise<void> => {
    Logger.info(`Received ${signal}, shutting down gracefully...`);

    try {
      // Stop device controller
      if (raspberrypiService) {
        raspberrypiService.stop();
        Logger.info('Device controller stopped');
      }

      // Publish offline status to MQTT
      if (localMqtt && localMqtt.isConnected()) {
        await localMqtt.publishOnlineStatus('false');
        Logger.info('Published offline status to local MQTT');
      }

      if (cloudMqtt && cloudMqtt.isConnected()) {
        await cloudMqtt.publish('myFinalProject/server/properties/online', 'false', { qos: 2, retain: true });
        Logger.info('Published offline status to cloud MQTT');
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
        Logger.info('MongoDB service stopped');
      }

      Logger.info('Shutdown complete');
      process.exit(0);
    } catch (error) {
      Logger.error('Error during shutdown', error as Error);
      process.exit(1);
    }
  };

  // Handle signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    Logger.error('Uncaught exception', error);
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    Logger.error('Unhandled promise rejection', reason as Error);
    shutdown('unhandledRejection');
  });
}

// Start the application
initialize();
