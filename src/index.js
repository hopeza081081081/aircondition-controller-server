/**
 * Main Entry Point
 * Orchestrates all modules and starts the application
 */

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
const DataSyncService = require('./services/DataSyncService');

// Global instances
let deviceModel;
let detectionState;
let localMqtt;
let cloudMqtt;
let messageHandler;
let personDetection;
let dataSync;
let deviceController;

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

    // Connect to MQTT brokers
    await localMqtt.initialize();
    await cloudMqtt.initialize();

    // Setup local MQTT subscriptions
    await localMqtt.setupSubscriptions(config.subscriptions);

    // Initialize message handler
    Logger.info('Initializing message handler...');
    messageHandler = new MessageHandler(deviceModel, cloudMqtt);

    // Wire up MQTT message events
    localMqtt.on('message', (topic, message) => {
      messageHandler.handle(topic, message);
    });

    // Initialize person detection service
    Logger.info('Initializing person detection service...');
    personDetection = new PersonDetectionService(
      detectionState,
      deviceModel,
      localMqtt,
      cloudMqtt,
      config
    );

    // Initialize data sync service (MongoDB worker thread)
    Logger.info('Initializing data sync service...');
    dataSync = new DataSyncService('./src/workers/MongoDBWorker.js');
    dataSync.initialize();

    // Store references in dataSync for DeviceController to access
    dataSync.localMqtt = localMqtt;
    dataSync.cloudMqtt = cloudMqtt;

    // Initialize device controller
    Logger.info('Initializing device controller...');
    deviceController = new DeviceController(
      deviceModel,
      personDetection,
      dataSync,
      config
    );

    // Start device controller
    deviceController.start();

    Logger.info('========================================');
    Logger.info('Application started successfully');
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

      // Stop data sync service
      if (dataSync) {
        dataSync.stop();
        Logger.info('Data sync service stopped');
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
