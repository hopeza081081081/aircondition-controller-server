/**
 * Main Entry Point
 * Orchestrates all modules and starts the application
 */

// Load environment variables first
require('dotenv').config();

const config = require('./config');
const Logger = require('./utils/Logger');

// Models
const DeviceDataModel = require('./models/DeviceDataModel');
const PersonDetectionState = require('./models/PersonDetectionState');

// Services
const LocalMqttService = require('./services/mqtt/LocalMqttService');
const CloudMqttService = require('./services/mqtt/CloudMqttService');
const MessageHandler = require('./services/mqtt/MessageHandler');
const PersonDetectionService = require('./services/PersonDetectionService');
const DeviceController = require('./services/DeviceController');
const MongoDBService = require('./services/MongoDBService');

// Global instances
let deviceModel;
let detectionState;
let localMqtt;
let cloudMqtt;
let messageHandler;
let personDetection;
let deviceController;
let mongoDBService;

/**
 * Initialize application
 */
async function initialize() {
  try {
    Logger.info('========================================');
    Logger.info('Air Conditioning Controller Server');
    Logger.info('========================================');

    // Initialize models
    Logger.info('Initializing models...');
    deviceModel = new DeviceDataModel(config);
    detectionState = new PersonDetectionState();

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
        Logger.warn('Failed to setup MQTT subscriptions', error);
      }
    }

    // Initialize message handler
    Logger.info('Initializing message handler...');
    messageHandler = new MessageHandler(deviceModel, cloudMqtt);

    // Wire up MQTT message events only if local MQTT is connected
    if (localMqtt.isInitialized() && localMqtt.isConnected()) {
      localMqtt.on('message', (topic, message) => {
        messageHandler.handle(topic, message);
      });
      Logger.info('Local MQTT message handler registered');
    } else {
      Logger.warn('Local MQTT not connected - message handling disabled');
    }

    // Initialize person detection service
    Logger.info('Initializing person detection service...');
    personDetection = new PersonDetectionService(
      detectionState,
      deviceModel,
      localMqtt,
      cloudMqtt,
      config
    );

    // Initialize MongoDB service (non-blocking)
    Logger.info('Initializing MongoDB service...');
    mongoDBService = new MongoDBService(config);

    try {
      await mongoDBService.connect();

      // Start periodic data saving
      mongoDBService.startPeriodicSaving(() => deviceModel.getDeviceState());
      Logger.info('MongoDB periodic saving started');
    } catch (error) {
      Logger.error('Failed to connect to MongoDB, but application will continue', error);
      Logger.warn('MongoDB features will be disabled');
    }

    // Initialize device controller
    Logger.info('Initializing device controller...');
    deviceController = new DeviceController(
      deviceModel,
      personDetection,
      localMqtt,
      cloudMqtt,
      config
    );

    // Start device controller
    deviceController.start();

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
    Logger.error('Failed to initialize application', error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    Logger.info(`Received ${signal}, shutting down gracefully...`);

    try {
      // Stop device controller
      if (deviceController) {
        deviceController.stop();
        Logger.info('Device controller stopped');
      }

      // Publish offline status to MQTT
      if (localMqtt && localMqtt.isConnected()) {
        await localMqtt.publishOnlineStatus('false');
        Logger.info('Published offline status to local MQTT');
      }

      if (cloudMqtt && cloudMqtt.isConnected()) {
        await cloudMqtt.relayServerStatus('false');
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
      Logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  // Handle signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    Logger.error('Uncaught exception', error);
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled promise rejection', reason, { promise });
    shutdown('unhandledRejection');
  });
}

// Start the application
initialize();
