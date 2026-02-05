/**
 * Main Entry Point
 * Application entry point - delegates to bootstrap and shutdown modules
 */

// Load environment variables first
import * as dotenv from "dotenv";
dotenv.config();

import { bootstrap } from "./bootstrap";
import { setupGracefulShutdown } from "./shutdown";
import Logger from "./utils/Logger";

/**
 * Main application entry
 */
async function main(): Promise<void> {
  try {
    // Bootstrap the application
    const appContext = await bootstrap();

    // Setup graceful shutdown
    setupGracefulShutdown({
      raspberrypiService: appContext.raspberrypiService,
      localMqtt: appContext.localMqtt,
      cloudMqtt: appContext.cloudMqtt,
      mongoDBService: appContext.mongoDBService,
    });
  } catch (error) {
    Logger.error("Application failed to start", error as Error);
    process.exit(1);
  }
}

// Start the application
main();
