"use strict";
/**
 * Graceful Shutdown Module
 * Handles application cleanup and shutdown procedures
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGracefulShutdown = setupGracefulShutdown;
const constants_1 = require("./config/constants");
const Logger = require("./utils/Logger");
/**
 * Setup graceful shutdown handlers for the application
 * @param handles - Service instances that need cleanup
 */
function setupGracefulShutdown(handles) {
    const shutdown = async (signal) => {
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
                await handles.cloudMqtt.publish(constants_1.MQTT_TOPICS.SERVER_ONLINE_STATUS, "false", { qos: constants_1.MQTT_QOS.EXACTLY_ONCE, retain: true });
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
        }
        catch (error) {
            Logger.error("Error during shutdown", error);
            process.exit(1);
        }
    };
    // Handle signals
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
        Logger.error("Uncaught exception", error);
        shutdown("uncaughtException");
    });
    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason) => {
        Logger.error("Unhandled promise rejection", reason);
        shutdown("unhandledRejection");
    });
}
//# sourceMappingURL=shutdown.js.map