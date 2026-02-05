/**
 * Graceful Shutdown Module
 * Handles application cleanup and shutdown procedures
 */

import { LocalMqttService } from "./services/mqtt/LocalMqttService";
import { CloudMqttService } from "./services/mqtt/CloudMqttService";
import RaspberrypiService from "./services/RaspberrypiService";
import MongoDBService from "./services/MongoDBService";
import { MQTT_TOPICS, MQTT_QOS } from "./config/constants";
const Logger = require("./utils/Logger");

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
export function setupGracefulShutdown(handles: ShutdownHandles): void {
  const shutdown = async (signal: string): Promise<void> => {
    Logger.info(`Received ${signal}, shutting down gracefully...`);

    try {
      // Stop device controller
      if (handles.raspberrypiService) {
        handles.raspberrypiService.stop();
        Logger.info("Device controller stopped");
      }

      // Publish offline status to MQTT
      if (handles.localMqtt && handles.localMqtt.isConnected()) {
        await handles.localMqtt.publishOnlineStatus("false");
        Logger.info("Published offline status to local MQTT");
      }

      if (handles.cloudMqtt && handles.cloudMqtt.isConnected()) {
        await handles.cloudMqtt.publish(
          MQTT_TOPICS.SERVER_ONLINE_STATUS,
          "false",
          { qos: MQTT_QOS.EXACTLY_ONCE, retain: true },
        );
        Logger.info("Published offline status to cloud MQTT");
      }

      // Disconnect MQTT
      if (handles.localMqtt) {
        handles.localMqtt.disconnect();
      }

      if (handles.cloudMqtt) {
        handles.cloudMqtt.disconnect();
      }

      // Stop MongoDB service
      if (handles.mongoDBService) {
        await handles.mongoDBService.stopPeriodicSaving();
        await handles.mongoDBService.disconnect();
        Logger.info("MongoDB service stopped");
      }

      Logger.info("Shutdown complete");
      process.exit(0);
    } catch (error) {
      Logger.error("Error during shutdown", error as Error);
      process.exit(1);
    }
  };

  // Handle signals
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    Logger.error("Uncaught exception", error);
    shutdown("uncaughtException");
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason: unknown) => {
    Logger.error("Unhandled promise rejection", reason as Error);
    shutdown("unhandledRejection");
  });
}
